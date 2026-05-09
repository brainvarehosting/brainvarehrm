import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  // ── Organization ──

  async getOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        businessUnits: { where: { isActive: true }, orderBy: { name: 'asc' } },
        locations: { where: { isActive: true }, orderBy: { name: 'asc' } },
        departments: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          include: { children: true },
        },
        grades: { where: { isActive: true }, orderBy: { level: 'asc' } },
        designations: { where: { isActive: true }, orderBy: { title: 'asc' } },
        costCenters: { where: { isActive: true }, orderBy: { name: 'asc' } },
        shifts: { where: { isActive: true }, orderBy: { name: 'asc' } },
      },
    });

    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateOrganization(id: string, data: any) {
    return this.prisma.organization.update({ where: { id }, data });
  }

  // ── Departments ──

  async getDepartments(orgId: string) {
    return this.prisma.department.findMany({
      where: { organizationId: orgId, isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          include: { children: { where: { isActive: true } } },
        },
        _count: { select: { employees: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(orgId: string, data: any) {
    return this.prisma.department.create({
      data: { ...data, organizationId: orgId },
    });
  }

  async updateDepartment(id: string, data: any) {
    return this.prisma.department.update({ where: { id }, data });
  }

  async deleteDepartment(id: string) {
    return this.prisma.department.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ── Locations ──

  async getLocations(orgId: string) {
    return this.prisma.location.findMany({
      where: { organizationId: orgId, isActive: true },
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createLocation(orgId: string, data: any) {
    return this.prisma.location.create({
      data: { ...data, organizationId: orgId },
    });
  }

  async updateLocation(id: string, data: any) {
    return this.prisma.location.update({ where: { id }, data });
  }

  // ── Designations ──

  async getDesignations(orgId: string) {
    return this.prisma.designation.findMany({
      where: { organizationId: orgId, isActive: true },
      include: { _count: { select: { employees: true } } },
      orderBy: { title: 'asc' },
    });
  }

  async createDesignation(orgId: string, data: any) {
    return this.prisma.designation.create({
      data: { ...data, organizationId: orgId },
    });
  }

  // ── Grades ──

  async getGrades(orgId: string) {
    return this.prisma.grade.findMany({
      where: { organizationId: orgId, isActive: true },
      include: { _count: { select: { employees: true } } },
      orderBy: { level: 'asc' },
    });
  }

  async createGrade(orgId: string, data: any) {
    return this.prisma.grade.create({
      data: { ...data, organizationId: orgId },
    });
  }

  // ── Business Units ──

  async getBusinessUnits(orgId: string) {
    return this.prisma.businessUnit.findMany({
      where: { organizationId: orgId, isActive: true },
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createBusinessUnit(orgId: string, data: any) {
    return this.prisma.businessUnit.create({
      data: { ...data, organizationId: orgId },
    });
  }

  // ── Cost Centers ──

  async getCostCenters(orgId: string) {
    return this.prisma.costCenter.findMany({
      where: { organizationId: orgId, isActive: true },
      include: { _count: { select: { employees: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCostCenter(orgId: string, data: any) {
    return this.prisma.costCenter.create({
      data: { ...data, organizationId: orgId },
    });
  }

  // ── Shifts ──

  async getShifts(orgId: string) {
    return this.prisma.shift.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createShift(orgId: string, data: any) {
    return this.prisma.shift.create({
      data: { ...data, organizationId: orgId },
    });
  }

  // ── Holidays ──

  async getHolidays(orgId: string, year?: number) {
    const where: any = { organizationId: orgId };
    if (year) {
      where.date = {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };
    }
    return this.prisma.holidayCalendar.findMany({
      where,
      orderBy: { date: 'asc' },
      include: { location: true },
    });
  }

  async createHoliday(orgId: string, data: any) {
    return this.prisma.holidayCalendar.create({
      data: { ...data, organizationId: orgId },
    });
  }

  // ── Dashboard Stats ──

  async getDashboardStats(orgId: string) {
    const [
      totalEmployees,
      activeEmployees,
      onProbation,
      onNotice,
      departmentCount,
      locationCount,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { organizationId: orgId } }),
      this.prisma.employee.count({
        where: { organizationId: orgId, employmentStatus: 'ACTIVE' },
      }),
      this.prisma.employee.count({
        where: { organizationId: orgId, employmentStatus: 'PROBATION' },
      }),
      this.prisma.employee.count({
        where: { organizationId: orgId, employmentStatus: 'NOTICE_PERIOD' },
      }),
      this.prisma.department.count({
        where: { organizationId: orgId, isActive: true },
      }),
      this.prisma.location.count({
        where: { organizationId: orgId, isActive: true },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      onProbation,
      onNotice,
      departmentCount,
      locationCount,
    };
  }
}
