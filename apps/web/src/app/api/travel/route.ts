import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0 });

    const requests = await prisma.travelRequest.findMany({
      where: { organizationId: orgId },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: requests, total: requests.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const body = await request.json();
    const req = await prisma.travelRequest.create({
      data: {
        organizationId: orgId,
        employeeId: body.employeeId,
        destination: body.destination,
        purpose: body.purpose || null,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        estimatedCost: body.estimatedCost ? parseFloat(body.estimatedCost) : null,
        advance: 0,
        status: 'PENDING',
        notes: body.notes || null,
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(req, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const req = await prisma.travelRequest.update({
      where: { id: body.id },
      data: {
        status: body.status,
        approvedBy: body.approvedBy || undefined,
        advance: body.advance !== undefined ? parseFloat(body.advance) : undefined,
        notes: body.notes || undefined,
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(req);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
