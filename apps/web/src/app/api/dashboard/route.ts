import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalEmployees,
      activeEmployees,
      newJoinersThisMonth,
      departmentBreakdown,
      attendanceToday,
      pendingLeaves,
      recentLeaves,
      latestPayroll,
      upcomingHolidays,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { employmentStatus: 'ACTIVE' } }),
      prisma.employee.count({ where: { dateOfJoining: { gte: monthStart } } }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        where: { employmentStatus: { in: ['ACTIVE', 'PROBATION'] } },
        _count: true,
      }),
      prisma.attendanceRecord.findMany({
        where: {
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
        select: { status: true },
      }),
      prisma.leaveTransaction.count({ where: { status: 'PENDING' } }),
      prisma.leaveTransaction.findMany({
        where: { status: 'PENDING' },
        include: {
          employee: { select: { firstName: true, lastName: true, employeeCode: true } },
          leaveType: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.payrollRun.findFirst({
        where: { organizationId: org.id },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        select: { month: true, year: true, status: true, totalGross: true, totalNet: true, totalEmployees: true },
      }),
      prisma.holiday.findMany({
        where: { date: { gte: now }, organizationId: org.id },
        orderBy: { date: 'asc' },
        take: 5,
      }),
    ]);

    // Get department names
    const deptIds = departmentBreakdown.map(d => d.departmentId).filter(Boolean);
    const departments = await prisma.department.findMany({
      where: { id: { in: deptIds as string[] } },
      select: { id: true, name: true },
    });
    const deptMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

    const present = attendanceToday.filter(a => ['PRESENT', 'LATE', 'WFH'].includes(a.status)).length;

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      newJoinersThisMonth,
      attendanceRate: totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0,
      presentToday: present,
      absentToday: totalEmployees - present,
      pendingLeaves,
      recentLeaveRequests: recentLeaves,
      departmentBreakdown: departmentBreakdown.map(d => ({
        department: deptMap[d.departmentId || ''] || 'Unassigned',
        count: d._count,
      })),
      latestPayroll,
      upcomingHolidays,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
  }
}
