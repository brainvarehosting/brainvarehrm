import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ departments: [], designations: [], locations: [], grades: [], employees: [] });

    const [departments, designations, locations, grades, employees] = await Promise.all([
      prisma.department.findMany({ where: { organizationId: org.id, isActive: true }, select: { id: true, name: true, code: true }, orderBy: { name: 'asc' } }),
      prisma.designation.findMany({ where: { organizationId: org.id, isActive: true }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
      prisma.location.findMany({ where: { organizationId: org.id, isActive: true }, select: { id: true, name: true, city: true }, orderBy: { name: 'asc' } }),
      prisma.grade.findMany({ where: { organizationId: org.id, isActive: true }, select: { id: true, name: true, level: true }, orderBy: { level: 'asc' } }),
      prisma.employee.findMany({ where: { organizationId: org.id, employmentStatus: 'ACTIVE' }, select: { id: true, firstName: true, lastName: true, employeeCode: true }, orderBy: { firstName: 'asc' } }),
    ]);

    return NextResponse.json({ departments, designations, locations, grades, employees });
  } catch (error: any) {
    console.error('Master data error:', error);
    return NextResponse.json({ departments: [], designations: [], locations: [], grades: [], employees: [] });
  }
}
