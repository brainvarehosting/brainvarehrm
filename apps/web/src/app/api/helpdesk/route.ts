import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0, open: 0 });
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const tickets = await prisma.helpdeskTicket.findMany({
      where: { organizationId: orgId, ...(status ? { status } : {}), ...(category ? { category } : {}) },
      include: { raisedBy: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: tickets, total: tickets.length, open: tickets.filter(t => t.status === 'OPEN').length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    const body = await request.json();
    const ticket = await prisma.helpdeskTicket.create({
      data: {
        organizationId: orgId, title: body.title, description: body.description || null,
        category: body.category || 'HR', priority: body.priority || 'MEDIUM',
        raisedById: body.raisedById, assignedToName: body.assignedToName || null, status: 'OPEN',
      },
      include: { raisedBy: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const ticket = await prisma.helpdeskTicket.update({
      where: { id: body.id },
      data: {
        status: body.status, assignedToName: body.assignedToName || undefined,
        resolution: body.resolution || undefined,
        resolvedAt: body.status === 'RESOLVED' ? new Date() : undefined,
      },
      include: { raisedBy: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
