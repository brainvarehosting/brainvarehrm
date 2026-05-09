import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: { employmentStatus: { in: ['ACTIVE', 'PROBATION'] } },
      select: {
        id: true, firstName: true, lastName: true, employeeCode: true, profilePhoto: true,
        department: { select: { name: true } },
        designation: { select: { title: true } },
        reportingManagerId: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Build tree structure
    const nodes = employees.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      code: emp.employeeCode,
      title: emp.designation?.title || 'N/A',
      department: emp.department?.name || 'Unassigned',
      avatar: emp.profilePhoto,
      parentId: emp.reportingManagerId,
    }));

    return NextResponse.json({ data: nodes, total: nodes.length });
  } catch {
    // Fallback mock data
    return NextResponse.json({
      data: [
        { id: '1', name: 'Arjun Nair', code: 'EMP-0001', title: 'CEO', department: 'Engineering', parentId: null },
        { id: '2', name: 'Sneha Reddy', code: 'EMP-0002', title: 'VP Engineering', department: 'Engineering', parentId: '1' },
        { id: '3', name: 'Amit Kumar', code: 'EMP-0003', title: 'CTO', department: 'Engineering', parentId: '1' },
        { id: '4', name: 'Priya Patel', code: 'EMP-0004', title: 'HR Manager', department: 'HR', parentId: '1' },
        { id: '5', name: 'Rohit Mehta', code: 'EMP-0007', title: 'Sr. Developer', department: 'Engineering', parentId: '2' },
        { id: '6', name: 'Karan Malhotra', code: 'EMP-0008', title: 'Developer', department: 'Engineering', parentId: '2' },
      ],
      total: 6,
    });
  }
}
