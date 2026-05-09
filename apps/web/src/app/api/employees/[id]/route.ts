import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        designation: true,
        location: true,
        grade: true,
        organization: { select: { id: true, name: true } },
        reportingManager: {
          select: {
            id: true, firstName: true, lastName: true,
            employeeCode: true, profilePhoto: true,
            designation: { select: { title: true } },
          },
        },
        directReports: {
          select: {
            id: true, firstName: true, lastName: true,
            employeeCode: true, profilePhoto: true,
            designation: { select: { title: true } },
          },
        },
        addresses: { orderBy: { createdAt: 'desc' } },
        emergencyContacts: true,
        salaryStructure: true,
        documents: { orderBy: { createdAt: 'desc' } },
        letters: { include: { template: { select: { name: true, category: true } } } },
        onboardingTasks: { orderBy: { sortOrder: 'asc' } },
        exitCase: { include: { clearanceTasks: true } },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Attendance records for current month
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { employeeId: id, date: { gte: monthStart } },
      orderBy: { date: 'desc' },
    });
    const attendanceSummary = {
      present: attendanceRecords.filter(r => r.status === 'PRESENT').length,
      absent: attendanceRecords.filter(r => r.status === 'ABSENT').length,
      late: attendanceRecords.filter(r => r.status === 'LATE').length,
      wfh: attendanceRecords.filter(r => r.status === 'WFH').length,
      halfDay: attendanceRecords.filter(r => r.status === 'HALF_DAY').length,
      onLeave: attendanceRecords.filter(r => r.status === 'ON_LEAVE').length,
      total: attendanceRecords.length,
    };

    // Recent attendance logs (last 15 entries for the attendance tab)
    const recentAttendance = attendanceRecords.slice(0, 15).map(r => ({
      date: r.date,
      status: r.status,
      checkIn: r.clockIn,
      checkOut: r.clockOut,
      workHours: r.workedMinutes ? (r.workedMinutes / 60) : null,
      source: r.source || 'MANUAL',
    }));

    // Leave balances
    const leaveBalances = await prisma.leaveBalance.findMany({
      where: { employeeId: id, year: now.getFullYear() },
      include: { leaveType: { select: { name: true, code: true } } },
    });

    // Recent leave transactions (last 10)
    const recentLeaves = await prisma.leaveTransaction.findMany({
      where: { employeeId: id },
      include: { leaveType: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Payroll slips (last 6 months)
    const payrollSlips = await prisma.payrollEntry.findMany({
      where: { employeeId: id },
      include: { payrollRun: { select: { month: true, year: true, status: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    // Assets — model not yet created, return empty
    const assets: any[] = [];

    // Build activity timeline from real data
    const activities: any[] = [];

    // Add attendance events
    attendanceRecords.slice(0, 5).forEach(r => {
      if (r.status === 'LATE' || r.status === 'ABSENT') {
        activities.push({
          date: r.date, type: 'attendance',
          title: r.status === 'LATE' ? 'Arrived late' : 'Marked absent',
          detail: r.clockIn ? `Check-in: ${new Date(r.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : 'No check-in recorded',
        });
      }
    });

    // Add leave events
    recentLeaves.slice(0, 5).forEach(l => {
      activities.push({
        date: l.startDate || l.createdAt, type: 'leave',
        title: `${l.leaveType?.name || 'Leave'} — ${l.status}`,
        detail: `${l.days || 1} day(s) · ${l.reason || 'No reason specified'}`,
      });
    });

    // Add document events
    (employee.documents || []).slice(0, 3).forEach((d: any) => {
      activities.push({
        date: d.createdAt, type: 'document',
        title: `Document uploaded: ${d.name}`,
        detail: `Category: ${(d.category || '').replace(/_/g, ' ')} · ${d.isVerified ? 'Verified' : 'Pending verification'}`,
      });
    });

    // Add letter events
    (employee.letters || []).slice(0, 3).forEach((l: any) => {
      activities.push({
        date: l.issuedAt || l.createdAt, type: 'letter',
        title: `Letter issued: ${l.template?.name || 'Unknown'}`,
        detail: `Category: ${l.template?.category || '—'} · Status: ${l.status || 'ISSUED'}`,
      });
    });

    // Add joining/confirmation milestones
    if (employee.dateOfConfirmation) {
      activities.push({ date: employee.dateOfConfirmation, type: 'milestone', title: 'Confirmed', detail: 'Probation completed successfully' });
    }
    activities.push({ date: employee.dateOfJoining, type: 'milestone', title: 'Joined Organization', detail: `Employee code: ${employee.employeeCode}` });

    // Sort all activities by date descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      ...employee,
      attendanceSummary,
      recentAttendance,
      leaveBalances,
      recentLeaves,
      payrollSlips,
      assets,
      activities,
    });
  } catch (error: any) {
    console.error('Employee fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: { department: true, designation: true, location: true, grade: true },
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Employee update error:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}
