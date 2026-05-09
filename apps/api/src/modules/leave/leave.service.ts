import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async getLeaveTypes(orgId: string) {
    return this.prisma.leaveType.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createLeaveType(orgId: string, data: any) {
    return this.prisma.leaveType.create({
      data: { ...data, organizationId: orgId },
    });
  }

  async getMyBalances(employeeId: string, year?: number) {
    const targetYear = year || new Date().getFullYear();
    return this.prisma.leaveBalance.findMany({
      where: { employeeId, year: targetYear },
      include: { leaveType: true },
    });
  }

  async applyLeave(employeeId: string, data: any) {
    // Get leave type
    const leaveType = await this.prisma.leaveType.findUnique({
      where: { id: data.leaveTypeId },
    });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    // Calculate days
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    let days = data.days || this.calculateDays(startDate, endDate);
    if (data.isHalfDay) days = 0.5;

    // Check balance
    const year = startDate.getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId: data.leaveTypeId,
          year,
        },
      },
    });

    const available = balance
      ? balance.opening + balance.accrued + balance.carryForward - balance.taken - balance.adjusted
      : 0;

    if (days > available) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${available}, Requested: ${days}`,
      );
    }

    // Check consecutive leave limits
    if (leaveType.maxConsecutive && days > leaveType.maxConsecutive) {
      throw new BadRequestException(
        `Maximum consecutive days for ${leaveType.name} is ${leaveType.maxConsecutive}`,
      );
    }

    // Check for overlapping leaves
    const overlapping = await this.prisma.leaveTransaction.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Leave dates overlap with existing leave application');
    }

    return this.prisma.leaveTransaction.create({
      data: {
        employeeId,
        leaveTypeId: data.leaveTypeId,
        startDate,
        endDate,
        days,
        isHalfDay: data.isHalfDay || false,
        halfDaySession: data.halfDaySession,
        reason: data.reason,
        proofUrl: data.proofUrl,
        status: 'PENDING',
      },
      include: { leaveType: { select: { name: true } } },
    });
  }

  async approveLeave(transactionId: string, approvedBy: string) {
    const leave = await this.prisma.leaveTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!leave) throw new NotFoundException('Leave not found');
    if (leave.status !== 'PENDING') {
      throw new BadRequestException('Leave is not in pending state');
    }

    // Update leave transaction
    const updated = await this.prisma.leaveTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    // Update balance
    const year = leave.startDate.getFullYear();
    await this.prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: leave.employeeId,
          leaveTypeId: leave.leaveTypeId,
          year,
        },
      },
      create: {
        employeeId: leave.employeeId,
        leaveTypeId: leave.leaveTypeId,
        year,
        taken: leave.days,
      },
      update: {
        taken: { increment: leave.days },
      },
    });

    // Mark attendance as ON_LEAVE for leave dates
    const dates = this.getDateRange(leave.startDate, leave.endDate);
    for (const date of dates) {
      await this.prisma.attendanceRecord.upsert({
        where: { employeeId_date: { employeeId: leave.employeeId, date } },
        create: {
          employeeId: leave.employeeId,
          date,
          status: 'ON_LEAVE',
          source: 'SYSTEM',
        },
        update: { status: 'ON_LEAVE' },
      });
    }

    return updated;
  }

  async rejectLeave(transactionId: string, approvedBy: string, reason: string) {
    const leave = await this.prisma.leaveTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!leave) throw new NotFoundException('Leave not found');

    return this.prisma.leaveTransaction.update({
      where: { id: transactionId },
      data: {
        status: 'REJECTED',
        approvedBy,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
    });
  }

  async cancelLeave(transactionId: string, employeeId: string) {
    const leave = await this.prisma.leaveTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!leave || leave.employeeId !== employeeId) {
      throw new NotFoundException('Leave not found');
    }
    if (!['PENDING', 'APPROVED'].includes(leave.status)) {
      throw new BadRequestException('Cannot cancel this leave');
    }

    // If was approved, restore balance
    if (leave.status === 'APPROVED') {
      const year = leave.startDate.getFullYear();
      await this.prisma.leaveBalance.update({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: leave.employeeId,
            leaveTypeId: leave.leaveTypeId,
            year,
          },
        },
        data: { taken: { decrement: leave.days } },
      });
    }

    return this.prisma.leaveTransaction.update({
      where: { id: transactionId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  async getPendingApprovals(managerId: string) {
    const directReports = await this.prisma.employee.findMany({
      where: { reportingManagerId: managerId },
      select: { id: true },
    });

    return this.prisma.leaveTransaction.findMany({
      where: {
        employeeId: { in: directReports.map((e: { id: string }) => e.id) },
        status: 'PENDING',
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true, employeeCode: true, profilePhoto: true },
        },
        leaveType: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTeamCalendar(managerId: string, month: number, year: number) {
    const directReports = await this.prisma.employee.findMany({
      where: { reportingManagerId: managerId },
      select: { id: true, firstName: true, lastName: true },
    });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const leaves = await this.prisma.leaveTransaction.findMany({
      where: {
        employeeId: { in: directReports.map((e: { id: string }) => e.id) },
        status: 'APPROVED',
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      include: {
        leaveType: { select: { name: true, code: true } },
      },
    });

    return { team: directReports, leaves };
  }

  // ── Helpers ──

  private calculateDays(start: Date, end: Date): number {
    let days = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  }

  private getDateRange(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}
