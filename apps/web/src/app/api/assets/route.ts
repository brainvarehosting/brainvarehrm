import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0, summary: {} });
    const assets = await prisma.asset.findMany({
      where: { organizationId: orgId },
      include: { assignedTo: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const summary = {
      total: assets.length,
      assigned: assets.filter(a => a.status === 'ASSIGNED').length,
      available: assets.filter(a => a.status === 'AVAILABLE').length,
      maintenance: assets.filter(a => a.status === 'MAINTENANCE').length,
      totalValue: assets.reduce((s, a) => s + (a.value || 0), 0),
    };
    return NextResponse.json({ data: assets, total: assets.length, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    const body = await request.json();
    const asset = await prisma.asset.create({
      data: {
        organizationId: orgId, name: body.name, category: body.category,
        serialNo: body.serialNo || null, assignedToId: body.assignedToId || null,
        status: body.assignedToId ? 'ASSIGNED' : 'AVAILABLE',
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        warrantyEnd: body.warrantyEnd ? new Date(body.warrantyEnd) : null,
        value: body.value ? parseFloat(body.value) : null, notes: body.notes || null,
      },
      include: { assignedTo: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        name: data.name, category: data.category, serialNo: data.serialNo,
        assignedToId: data.assignedToId || null,
        status: data.status || (data.assignedToId ? 'ASSIGNED' : 'AVAILABLE'),
        value: data.value ? parseFloat(data.value) : undefined, notes: data.notes,
      },
      include: { assignedTo: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(asset);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
