import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ headcount: { total: 0, active: 0, probation: 0, onNotice: 0 } });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [employees, deptGroups, attendance, lastMonthAttendance, payrollRuns, leaveTransactions] = await Promise.all([
      prisma.employee.findMany({
        where: { organizationId: orgId },
        select: {
          employmentStatus: true, gender: true, dateOfBirth: true,
          dateOfJoining: true, departmentId: true,
          department: { select: { name: true } },
        },
      }),
      prisma.employee.groupBy({
        by: ['departmentId'],
        where: { organizationId: orgId, employmentStatus: { in: ['ACTIVE', 'PROBATION'] } },
        _count: { id: true },
      }),
      prisma.attendanceRecord.findMany({
        where: { employee: { organizationId: orgId }, date: { gte: startOfMonth } },
        select: { status: true },
      }),
      prisma.attendanceRecord.findMany({
        where: { employee: { organizationId: orgId }, date: { gte: startOfLastMonth, lte: endOfLastMonth } },
        select: { status: true },
      }),
      prisma.payrollRun.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          entries: { select: { grossPay: true, netPay: true, totalDeductions: true } },
        },
      }),
      prisma.leaveTransaction.findMany({
        where: { employee: { organizationId: orgId }, status: 'APPROVED' },
        select: { days: true, leaveType: { select: { name: true } } },
      }),
    ]);

    const active = employees.filter(e => e.employmentStatus === 'ACTIVE').length;
    const probation = employees.filter(e => e.employmentStatus === 'PROBATION').length;
    const onNotice = employees.filter(e => e.employmentStatus === 'NOTICE').length;
    const exited = employees.filter(e => e.employmentStatus === 'SEPARATED').length;

    const genderMap: Record<string, number> = {};
    const ageMap: Record<string, number> = { '21-25': 0, '26-30': 0, '31-35': 0, '36-40': 0, '40+': 0 };
    for (const e of employees) {
      if (e.gender) genderMap[e.gender] = (genderMap[e.gender] || 0) + 1;
      if (e.dateOfBirth) {
        const age = Math.floor((now.getTime() - new Date(e.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000));
        if (age <= 25) ageMap['21-25']++;
        else if (age <= 30) ageMap['26-30']++;
        else if (age <= 35) ageMap['31-35']++;
        else if (age <= 40) ageMap['36-40']++;
        else ageMap['40+']++;
      }
    }

    const totalActive = active + probation;
    const deptNames = await prisma.department.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    });
    const deptNameMap = Object.fromEntries(deptNames.map(d => [d.id, d.name]));

    const departmentBreakdown = deptGroups.map(g => ({
      department: deptNameMap[g.departmentId || ''] || 'Unassigned',
      count: g._count.id,
      percentage: totalActive > 0 ? Math.round((g._count.id / totalActive) * 100) : 0,
    }));

    const presentThis = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const presentLast = lastMonthAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendanceRate = {
      thisMonth: attendance.length > 0 ? Math.round((presentThis / attendance.length) * 100) : 0,
      lastMonth: lastMonthAttendance.length > 0 ? Math.round((presentLast / lastMonthAttendance.length) * 100) : 0,
    };

    const latestRun = payrollRuns[0];
    const payrollSummary = latestRun ? {
      totalGross: latestRun.entries.reduce((s, e) => s + (e.grossPay || 0), 0),
      totalNet: latestRun.entries.reduce((s, e) => s + (e.netPay || 0), 0),
      totalDeductions: latestRun.entries.reduce((s, e) => s + (e.totalDeductions || 0), 0),
      avgSalary: latestRun.entries.length > 0
        ? Math.round(latestRun.entries.reduce((s, e) => s + (e.grossPay || 0), 0) / latestRun.entries.length)
        : 0,
    } : { totalGross: 0, totalNet: 0, totalDeductions: 0, avgSalary: 0 };

    const leaveTotalDays = leaveTransactions.reduce((s, t) => s + (t.days || 0), 0);

    return NextResponse.json({
      headcount: { total: employees.length, active, probation, onNotice, exited },
      departmentBreakdown,
      genderRatio: genderMap,
      ageDistribution: Object.entries(ageMap).map(([range, count]) => ({ range, count })),
      attrition: {
        current: employees.length > 0 ? Math.round((exited / employees.length) * 100 * 10) / 10 : 0,
      },
      leaveUtilization: {
        totalDaysTaken: leaveTotalDays,
        avgPerEmployee: totalActive > 0 ? Math.round((leaveTotalDays / totalActive) * 10) / 10 : 0,
      },
      payrollSummary,
      attendanceRate,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
