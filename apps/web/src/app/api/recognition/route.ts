import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0 });
    const records = await prisma.recognition.findMany({
      where: { organizationId: orgId },
      include: {
        fromEmployee: { select: { firstName: true, lastName: true, employeeCode: true } },
        toEmployee: { select: { firstName: true, lastName: true, employeeCode: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ data: records, total: records.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    const body = await request.json();
    const record = await prisma.recognition.create({
      data: {
        organizationId: orgId, fromEmployeeId: body.fromEmployeeId,
        toEmployeeId: body.toEmployeeId, badge: body.badge,
        message: body.message, category: body.category || 'Excellence',
      },
      include: {
        fromEmployee: { select: { firstName: true, lastName: true, employeeCode: true } },
        toEmployee: { select: { firstName: true, lastName: true, employeeCode: true } },
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const record = await prisma.recognition.update({
      where: { id: body.id }, data: { likes: { increment: 1 } },
    });
    return NextResponse.json(record);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
