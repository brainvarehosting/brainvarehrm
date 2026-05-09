import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// India statutory constants
const PF_RATE_EMPLOYEE = 0.12;
const PF_RATE_EMPLOYER = 0.12;
const PF_BASIC_CAP = 15000; // PF applicable on basic up to ₹15,000
const ESIC_RATE_EMPLOYEE = 0.0075;
const ESIC_RATE_EMPLOYER = 0.0325;
const ESIC_GROSS_CAP = 21000; // ESIC applicable if gross ≤ ₹21,000

// Professional Tax slabs (Maharashtra example - configurable per state)
const PT_SLABS_MAHARASHTRA = [
  { min: 0, max: 7500, pt: 0 },
  { min: 7501, max: 10000, pt: 175 },
  { min: 10001, max: Infinity, pt: 200 }, // ₹300 in Feb
];

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // ── Salary Structure ──

  async getSalaryStructure(employeeId: string) {
    return this.prisma.salaryStructure.findUnique({
      where: { employeeId },
    });
  }

  async createSalaryStructure(employeeId: string, data: any) {
    const calculated = this.calculateSalaryBreakup(data);

    return this.prisma.salaryStructure.create({
      data: {
        employeeId,
        ...calculated,
        effectiveFrom: new Date(data.effectiveFrom || new Date()),
      },
    });
  }

  async updateSalaryStructure(employeeId: string, data: any) {
    const calculated = this.calculateSalaryBreakup(data);

    // Save current as history
    const current = await this.prisma.salaryStructure.findUnique({
      where: { employeeId },
    });

    if (current) {
      await this.prisma.compensationHistory.create({
        data: {
          employeeId,
          eventType: 'REVISION',
          previousCtc: current.ctc,
          newCtc: calculated.ctc,
          previousBasic: current.basic,
          newBasic: calculated.basic,
          effectiveDate: new Date(data.effectiveFrom || new Date()),
        },
      });
    }

    return this.prisma.salaryStructure.upsert({
      where: { employeeId },
      create: {
        employeeId,
        ...calculated,
        effectiveFrom: new Date(data.effectiveFrom || new Date()),
      },
      update: {
        ...calculated,
        effectiveFrom: new Date(data.effectiveFrom || new Date()),
      },
    });
  }

  // ── Payroll Run ──

  async createPayrollRun(orgId: string, month: number, year: number) {
    const existing = await this.prisma.payrollRun.findUnique({
      where: { organizationId_month_year: { organizationId: orgId, month, year } },
    });
    if (existing) {
      throw new BadRequestException(`Payroll run already exists for ${month}/${year}`);
    }

    return this.prisma.payrollRun.create({
      data: { organizationId: orgId, month, year, status: 'DRAFT' },
    });
  }

  async processPayroll(runId: string) {
    const run = await this.prisma.payrollRun.findUnique({
      where: { id: runId },
    });
    if (!run) throw new NotFoundException('Payroll run not found');
    if (run.status !== 'DRAFT') {
      throw new BadRequestException('Payroll can only be processed from DRAFT state');
    }

    // Update status to PROCESSING
    await this.prisma.payrollRun.update({
      where: { id: runId },
      data: { status: 'PROCESSING' },
    });

    try {
      // Get all active employees with salary structures
      const employees = await this.prisma.employee.findMany({
        where: {
          organizationId: run.organizationId,
          employmentStatus: { in: ['ACTIVE', 'PROBATION', 'NOTICE_PERIOD'] },
          salaryStructure: { isNot: null },
        },
        include: {
          salaryStructure: true,
          location: { select: { state: true, ptState: true } },
        },
      });

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;

      for (const emp of employees) {
        if (!emp.salaryStructure) continue;

        const sal = emp.salaryStructure;

        // Calculate LOP (Loss of Pay)
        const lopDays = await this.calculateLOP(emp.id, run.month, run.year);
        const workingDays = this.getWorkingDays(run.month, run.year);
        const paidDays = workingDays - lopDays;

        // Prorate salary
        const ratio = paidDays / workingDays;
        const earnings: any = {
          basic: Math.round(sal.basic * ratio),
          hra: Math.round(sal.hra * ratio),
          da: Math.round((sal.da || 0) * ratio),
          conveyance: Math.round((sal.conveyance || 0) * ratio),
          medical: Math.round((sal.medical || 0) * ratio),
          special: Math.round((sal.special || 0) * ratio),
          lta: Math.round((sal.lta || 0) * ratio),
        };

        const grossPay = Object.values(earnings).reduce((a: number, b: any) => a + (b as number), 0) as number;

        // Calculate deductions
        const pfBasic = Math.min(earnings.basic, PF_BASIC_CAP);
        const pfEmployee = Math.round(pfBasic * PF_RATE_EMPLOYEE);
        const pfEmployer = Math.round(pfBasic * PF_RATE_EMPLOYER);

        let esicEmployee = 0;
        let esicEmployer = 0;
        if (grossPay <= ESIC_GROSS_CAP) {
          esicEmployee = Math.round(grossPay * ESIC_RATE_EMPLOYEE);
          esicEmployer = Math.round(grossPay * ESIC_RATE_EMPLOYER);
        }

        const pt = this.calculatePT(grossPay, emp.location?.ptState || 'MH', run.month);
        const tds = Math.round(sal.tds || 0); // TDS from salary structure (can be enhanced)

        const deductions: any = {
          pfEmployee,
          pfEmployer,
          esicEmployee,
          esicEmployer,
          pt,
          tds,
          lop: Math.round((sal.grossMonthly / workingDays) * lopDays),
        };

        const totalDeductionsForEmp = pfEmployee + esicEmployee + pt + tds + deductions.lop;
        const netPay = grossPay - totalDeductionsForEmp;

        await this.prisma.payrollEntry.create({
          data: {
            payrollRunId: runId,
            employeeId: emp.id,
            earnings,
            deductions,
            grossPay,
            totalDeductions: totalDeductionsForEmp,
            netPay,
            lopDays,
            workingDays,
            paidDays,
          },
        });

        totalGross += grossPay;
        totalDeductions += totalDeductionsForEmp;
        totalNet += netPay;
      }

      // Update run with totals
      return this.prisma.payrollRun.update({
        where: { id: runId },
        data: {
          status: 'REVIEW',
          totalGross,
          totalDeductions,
          totalNet,
          totalEmployees: employees.length,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      // Revert to DRAFT on failure
      await this.prisma.payrollRun.update({
        where: { id: runId },
        data: { status: 'DRAFT', remarks: `Processing failed: ${error.message}` },
      });
      throw error;
    }
  }

  async lockPayroll(runId: string, userId: string) {
    const run = await this.prisma.payrollRun.findUnique({ where: { id: runId } });
    if (!run) throw new NotFoundException('Payroll run not found');
    if (run.status !== 'REVIEW' && run.status !== 'APPROVED') {
      throw new BadRequestException('Payroll must be in REVIEW or APPROVED state to lock');
    }

    return this.prisma.payrollRun.update({
      where: { id: runId },
      data: { status: 'LOCKED', lockedAt: new Date(), lockedBy: userId },
    });
  }

  async getPayrollRun(runId: string) {
    return this.prisma.payrollRun.findUnique({
      where: { id: runId },
      include: {
        entries: {
          include: {
            employee: {
              select: {
                firstName: true,
                lastName: true,
                employeeCode: true,
                department: { select: { name: true } },
                bankName: true,
                bankAccountNo: true,
                bankIfsc: true,
              },
            },
          },
          orderBy: { employee: { firstName: 'asc' } },
        },
      },
    });
  }

  async getPayrollRuns(orgId: string) {
    return this.prisma.payrollRun.findMany({
      where: { organizationId: orgId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: { _count: { select: { entries: true } } },
    });
  }

  async getMyPayslips(employeeId: string) {
    return this.prisma.payrollEntry.findMany({
      where: { employeeId },
      include: {
        payrollRun: {
          select: { month: true, year: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Calculation Helpers ──

  private calculateSalaryBreakup(data: any) {
    const ctc = data.ctc;
    const monthlyCtc = ctc / 12;

    // Standard India salary breakup
    const basic = Math.round(monthlyCtc * 0.40); // 40% of CTC
    const hra = Math.round(basic * 0.50); // 50% of basic (metro)
    const da = 0;
    const conveyance = Math.min(1600, Math.round(monthlyCtc * 0.05));
    const medical = Math.min(1250, Math.round(monthlyCtc * 0.04));
    const lta = Math.round(monthlyCtc * 0.05);

    // PF calculation
    const pfBasic = Math.min(basic, PF_BASIC_CAP);
    const pfEmployee = Math.round(pfBasic * PF_RATE_EMPLOYEE);
    const pfEmployer = Math.round(pfBasic * PF_RATE_EMPLOYER);

    // ESIC
    const estimatedGross = basic + hra + conveyance + medical + lta;
    let esicEmployee = 0;
    let esicEmployer = 0;
    if (estimatedGross <= ESIC_GROSS_CAP) {
      esicEmployee = Math.round(estimatedGross * ESIC_RATE_EMPLOYEE);
      esicEmployer = Math.round(estimatedGross * ESIC_RATE_EMPLOYER);
    }

    // PT (default Maharashtra)
    const pt = this.calculatePT(estimatedGross, data.ptState || 'MH', 1);

    // TDS (simplified — monthly estimate)
    const annualTaxableIncome = ctc - (pfEmployee * 12) - 50000; // Standard deduction
    const tds = Math.max(0, Math.round(this.calculateIncomeTax(annualTaxableIncome) / 12));

    // Special allowance (balancing figure)
    const special = Math.round(
      monthlyCtc - basic - hra - da - conveyance - medical - lta - pfEmployer - esicEmployer,
    );

    const grossMonthly = basic + hra + da + conveyance + medical + special + lta;
    const netMonthly = grossMonthly - pfEmployee - esicEmployee - pt - tds;

    return {
      ctc,
      basic,
      hra,
      da,
      conveyance,
      medical,
      special: Math.max(0, special),
      lta,
      pfEmployee,
      pfEmployer,
      esicEmployee,
      esicEmployer,
      pt,
      tds,
      grossMonthly,
      netMonthly,
    };
  }

  private calculatePT(gross: number, state: string, month: number): number {
    // Maharashtra PT slabs (simplified)
    if (state === 'MH' || state === 'Maharashtra') {
      if (gross <= 7500) return 0;
      if (gross <= 10000) return 175;
      return month === 2 ? 300 : 200; // Feb has ₹300
    }
    // Karnataka
    if (state === 'KA' || state === 'Karnataka') {
      if (gross <= 15000) return 0;
      if (gross <= 25000) return 200;
      return 200;
    }
    // Default
    if (gross <= 10000) return 0;
    return 200;
  }

  private calculateIncomeTax(taxableIncome: number): number {
    // New Tax Regime FY 2024-25 (simplified)
    if (taxableIncome <= 300000) return 0;
    if (taxableIncome <= 700000) return (taxableIncome - 300000) * 0.05;
    if (taxableIncome <= 1000000) return 20000 + (taxableIncome - 700000) * 0.10;
    if (taxableIncome <= 1200000) return 50000 + (taxableIncome - 1000000) * 0.15;
    if (taxableIncome <= 1500000) return 80000 + (taxableIncome - 1200000) * 0.20;
    return 140000 + (taxableIncome - 1500000) * 0.30;
  }

  private async calculateLOP(employeeId: string, month: number, year: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Count unpaid leave (LOP) days
    const unpaidLeaves = await this.prisma.leaveTransaction.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        leaveType: { isPaid: false },
      },
    });

    let lopDays = 0;
    for (const leave of unpaidLeaves) {
      const leaveStart = leave.startDate > startDate ? leave.startDate : startDate;
      const leaveEnd = leave.endDate < endDate ? leave.endDate : endDate;
      const diff = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      lopDays += diff;
    }

    // Count absent days (no attendance, no leave)
    const absentCount = await this.prisma.attendanceRecord.count({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate },
        status: 'ABSENT',
      },
    });

    return lopDays + absentCount;
  }

  private getWorkingDays(month: number, year: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        workingDays++;
      }
    }
    return workingDays;
  }
}
