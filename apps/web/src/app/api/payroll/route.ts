import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const payrollRuns = await prisma.payrollRun.findMany({
      where: { organizationId: org.id },
      include: {
        entries: {
          include: {
            employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return NextResponse.json({ data: payrollRuns });
  } catch (error: any) {
    console.error('Payroll error:', error);
    return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'No org' }, { status: 400 });

    const month = data.month || new Date().getMonth() + 1;
    const year = data.year || new Date().getFullYear();

    // Get all active employees with salary
    const employees = await prisma.employee.findMany({
      where: { organizationId: org.id, employmentStatus: 'ACTIVE' },
      include: { salaryStructure: true },
    });

    let totalGross = 0, totalNet = 0;
    const entriesData = employees.map((emp: any) => {
      const s = emp.salaryStructure;
      const gross = s?.grossMonthly || 0;
      const deductions = (s?.pfEmployee || 0) + (s?.pt || 0) + (s?.tds || 0);
      const net = gross - deductions;
      totalGross += gross;
      totalNet += net;
      return {
        employeeId: emp.id,
        basic: s?.basic || 0, hra: s?.hra || 0, special: s?.special || 0,
        conveyance: s?.conveyance || 0, medical: s?.medical || 0,
        grossPay: gross,
        pfEmployee: s?.pfEmployee || 0, pfEmployer: s?.pfEmployer || 0,
        esi: 0, pt: s?.pt || 0, tds: s?.tds || 0,
        totalDeductions: deductions,
        netPay: net,
        lop: 0, lopDays: 0,
      };
    });

    const run = await prisma.payrollRun.create({
      data: {
        organizationId: org.id, month, year,
        status: 'DRAFT', totalEmployees: employees.length,
        totalGross, totalNet,
        entries: { create: entriesData },
      },
      include: { entries: { include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } } } },
    });

    return NextResponse.json(run, { status: 201 });
  } catch (error: any) {
    console.error('Payroll create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
