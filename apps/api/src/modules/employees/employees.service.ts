import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, query: PaginationDto) {
    const where: any = { organizationId: orgId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, title: true } },
          location: { select: { id: true, name: true, city: true } },
          grade: { select: { id: true, name: true } },
          reportingManager: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true },
          },
        },
        skip: query.skip,
        take: query.limit,
        orderBy: query.sortBy
          ? { [query.sortBy]: query.sortOrder || 'asc' }
          : { firstName: 'asc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return new PaginatedResponse(data, total, query.page!, query.limit!);
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        location: true,
        grade: true,
        businessUnit: true,
        costCenter: true,
        reportingManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            profilePhoto: true,
            designation: { select: { title: true } },
          },
        },
        directReports: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            profilePhoto: true,
            designation: { select: { title: true } },
          },
        },
        addresses: { orderBy: { createdAt: 'desc' } },
        emergencyContacts: true,
        salaryStructure: true,
        employmentHistory: { orderBy: { effectiveDate: 'desc' } },
        compensationHistory: { orderBy: { effectiveDate: 'desc' } },
      },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async create(orgId: string, data: any) {
    // Auto-generate employee code
    const lastEmployee = await this.prisma.employee.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      select: { employeeCode: true },
    });

    let nextCode = 'EMP-0001';
    if (lastEmployee) {
      const lastNum = parseInt(lastEmployee.employeeCode.replace(/\D/g, ''));
      nextCode = `EMP-${String(lastNum + 1).padStart(4, '0')}`;
    }

    const employee = await this.prisma.employee.create({
      data: {
        ...data,
        employeeCode: data.employeeCode || nextCode,
        organizationId: orgId,
      },
      include: {
        department: true,
        designation: true,
        location: true,
      },
    });

    // Create employment history entry
    await this.prisma.employmentHistory.create({
      data: {
        employeeId: employee.id,
        eventType: 'JOINED',
        toValue: employee.employeeCode,
        effectiveDate: employee.dateOfJoining,
      },
    });

    return employee;
  }

  async update(id: string, data: any) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');

    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        department: true,
        designation: true,
        location: true,
        grade: true,
      },
    });
  }

  async getProfile360(id: string) {
    const employee = await this.findOne(id);

    const [
      attendanceSummary,
      leaveBalances,
      recentLeaves,
      documents,
      letters,
      onboardingTasks,
      exitCase,
    ] = await Promise.all([
      // Attendance summary (current month)
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: {
          employeeId: id,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _count: true,
      }),
      // Leave balances
      this.prisma.leaveBalance.findMany({
        where: { employeeId: id, year: new Date().getFullYear() },
        include: { leaveType: { select: { name: true, code: true } } },
      }),
      // Recent leave transactions
      this.prisma.leaveTransaction.findMany({
        where: { employeeId: id },
        include: { leaveType: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Documents
      this.prisma.document.findMany({
        where: { employeeId: id },
        orderBy: { createdAt: 'desc' },
      }),
      // Letters
      this.prisma.letterIssue.findMany({
        where: { employeeId: id },
        include: { template: { select: { name: true, category: true } } },
        orderBy: { issuedAt: 'desc' },
      }),
      // Onboarding tasks
      this.prisma.onboardingTask.findMany({
        where: { employeeId: id },
        orderBy: { sortOrder: 'asc' },
      }),
      // Exit case
      this.prisma.exitCase.findUnique({
        where: { employeeId: id },
        include: { clearanceTasks: true },
      }),
    ]);

    return {
      ...employee,
      attendanceSummary,
      leaveBalances,
      recentLeaves,
      documents,
      letters,
      onboardingTasks,
      exitCase,
    };
  }

  async getDirectReports(managerId: string, query: PaginationDto) {
    const where = { reportingManagerId: managerId };
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          department: { select: { name: true } },
          designation: { select: { title: true } },
        },
        skip: query.skip,
        take: query.limit,
        orderBy: { firstName: 'asc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return new PaginatedResponse(data, total, query.page!, query.limit!);
  }

  async getHeadcountByDepartment(orgId: string) {
    return this.prisma.employee.groupBy({
      by: ['departmentId'],
      where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
      _count: true,
    });
  }
}
