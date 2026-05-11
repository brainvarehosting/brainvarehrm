import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0, totalHours: 0, totalAmount: 0 });
    const entries = await prisma.overtimeEntry.findMany({
      where: { organizationId: orgId },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({
      data: entries, total: entries.length,
      totalHours: entries.reduce((s, o) => s + o.hours, 0),
      totalAmount: entries.reduce((s, o) => s + o.amount, 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    const body = await request.json();
    const hours = parseFloat(body.hours) || 0;
    const rate = parseFloat(body.rate) || 0;
    const entry = await prisma.overtimeEntry.create({
      data: {
        organizationId: orgId, employeeId: body.employeeId,
        date: new Date(body.date), hours, rate, amount: hours * rate,
        reason: body.reason || null, status: 'PENDING',
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const entry = await prisma.overtimeEntry.update({
      where: { id: body.id },
      data: {
        status: body.status, approvedBy: body.approvedBy || null,
        approvedAt: body.status === 'APPROVED' ? new Date() : null,
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
