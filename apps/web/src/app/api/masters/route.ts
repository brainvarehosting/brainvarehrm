import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

    const [departments, designations, grades, locations] = await Promise.all([
      prisma.department.findMany({ where: { organizationId: org.id }, orderBy: { name: 'asc' } }),
      prisma.designation.findMany({ where: { organizationId: org.id }, orderBy: { title: 'asc' } }),
      prisma.grade.findMany({ where: { organizationId: org.id }, orderBy: { level: 'asc' } }),
      prisma.location.findMany({ where: { organizationId: org.id }, orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({ departments, designations, grades, locations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const org = await prisma.organization.findFirst();
    const orgId = org!.id;

    switch (data.type) {
      case 'department': {
        const dept = await prisma.department.create({ data: { name: data.name, code: data.code, organizationId: orgId } });
        return NextResponse.json(dept, { status: 201 });
      }
      case 'designation': {
        const desig = await prisma.designation.create({ data: { title: data.title, organizationId: orgId } });
        return NextResponse.json(desig, { status: 201 });
      }
      case 'grade': {
        const grade = await prisma.grade.create({ data: { name: data.name, level: data.level || 1, organizationId: orgId } });
        return NextResponse.json(grade, { status: 201 });
      }
      case 'location': {
        const loc = await prisma.location.create({ data: { name: data.name, code: data.code || data.name.substring(0,3).toUpperCase(), city: data.city || '', state: data.state || '', country: data.country || 'India', organizationId: orgId } });
        return NextResponse.json(loc, { status: 201 });
      }
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
