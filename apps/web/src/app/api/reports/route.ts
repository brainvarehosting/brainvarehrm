import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [totalEmployees, deptCounts, statusCounts, genderCounts, monthlyJoins, avgTenure, leaveStats, attendanceStats, payrollStats] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.groupBy({ by: ['departmentId'], _count: true }),
      prisma.employee.groupBy({ by: ['employmentStatus'], _count: true }),
      prisma.employee.groupBy({ by: ['gender'], _count: true }),
      // Monthly joining trend (last 6 months)
      prisma.$queryRawUnsafe(`SELECT strftime('%Y-%m', dateOfJoining) as month, COUNT(*) as count FROM Employee WHERE dateOfJoining >= date('now', '-6 months') GROUP BY month ORDER BY month`),
      // Average tenure
      prisma.$queryRawUnsafe(`SELECT AVG((julianday('now') - julianday(dateOfJoining))/365.25) as avgYears FROM Employee WHERE employmentStatus = 'ACTIVE'`),
      // Leave stats
      prisma.leaveTransaction.groupBy({ by: ['status'], _count: true }),
      // Attendance this month
      prisma.$queryRawUnsafe(`SELECT status, COUNT(*) as count FROM AttendanceRecord WHERE strftime('%Y-%m', date) = strftime('%Y-%m', 'now') GROUP BY status`),
      // Payroll
      prisma.payrollRun.findMany({ select: { month: true, year: true, totalGross: true, totalNet: true, totalEmployees: true }, orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 6 }),
    ]);

    // Resolve department names
    const departments = await prisma.department.findMany({ select: { id: true, name: true } });
    const deptMap = Object.fromEntries(departments.map((d: any) => [d.id, d.name]));
    const departmentBreakdown = deptCounts.map((d: any) => ({ name: deptMap[d.departmentId] || 'Unassigned', count: d._count }));

    return NextResponse.json({
      headcount: { total: totalEmployees, byStatus: statusCounts, byGender: genderCounts, byDepartment: departmentBreakdown },
      trends: { monthlyJoins, avgTenure },
      leave: { byStatus: leaveStats },
      attendance: { thisMonth: attendanceStats },
      payroll: payrollStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
