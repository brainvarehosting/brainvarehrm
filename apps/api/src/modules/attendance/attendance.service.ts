import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async clockIn(employeeId: string, data: { source?: string; latitude?: number; longitude?: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (existing?.clockIn) {
      throw new BadRequestException('Already clocked in today');
    }

    const now = new Date();

    if (existing) {
      return this.prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: {
          clockIn: now,
          status: 'PRESENT',
          source: (data.source as any) || 'WEB',
          latitude: data.latitude,
          longitude: data.longitude,
        },
      });
    }

    return this.prisma.attendanceRecord.create({
      data: {
        employeeId,
        date: today,
        clockIn: now,
        status: 'PRESENT',
        source: (data.source as any) || 'WEB',
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });
  }

  async clockOut(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (!record) {
      throw new BadRequestException('No clock-in found for today');
    }

    if (record.clockOut) {
      throw new BadRequestException('Already clocked out today');
    }

    const now = new Date();
    const workedMinutes = record.clockIn
      ? Math.round((now.getTime() - record.clockIn.getTime()) / 60000)
      : 0;

    // Check for anomalies
    let isAnomaly = false;
    let anomalyType: string | null = null;

    if (workedMinutes < 240) {
      isAnomaly = true;
      anomalyType = 'EARLY_OUT';
    }

    return this.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        clockOut: now,
        workedMinutes,
        isAnomaly,
        anomalyType,
        status: workedMinutes < 240 ? 'HALF_DAY' : 'PRESENT',
      },
    });
  }

  async getMyAttendance(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate },
      },
      include: { shift: { select: { name: true, startTime: true, endTime: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async getTeamAttendance(managerId: string, date: Date) {
    const directReports = await this.prisma.employee.findMany({
      where: { reportingManagerId: managerId, employmentStatus: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true, employeeCode: true, profilePhoto: true },
    });

    const employeeIds = directReports.map((e: { id: string }) => e.id);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        employeeId: { in: employeeIds },
        date: targetDate,
      },
    });

    const recordMap = new Map(records.map((r: any) => [r.employeeId, r]));

    return directReports.map((emp: any) => ({
      ...emp,
      attendance: recordMap.get(emp.id) || { status: 'ABSENT', clockIn: null, clockOut: null },
    }));
  }

  async getAnomalies(orgId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.attendanceRecord.findMany({
      where: {
        employee: { organizationId: orgId },
        date: { gte: startDate, lte: endDate },
        isAnomaly: true,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async regularize(recordId: string, data: { remarks: string; status: string }, approvedBy: string) {
    return this.prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        isRegularized: true,
        isAnomaly: false,
        anomalyType: null,
        status: data.status as any,
        remarks: data.remarks,
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  async getAttendanceSummary(orgId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const summary = await this.prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: {
        employee: { organizationId: orgId },
        date: { gte: startDate, lte: endDate },
      },
      _count: true,
    });

    const anomalyCount = await this.prisma.attendanceRecord.count({
      where: {
        employee: { organizationId: orgId },
        date: { gte: startDate, lte: endDate },
        isAnomaly: true,
      },
    });

    return { summary, anomalyCount };
  }
}
