import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0 });

    const positions = await prisma.position.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: positions, total: positions.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const body = await request.json();
    const position = await prisma.position.create({
      data: {
        organizationId: orgId,
        title: body.title,
        departmentName: body.departmentName || null,
        locationName: body.locationName || null,
        gradeName: body.gradeName || null,
        jobType: body.jobType || 'FULL_TIME',
        workMode: body.workMode || 'OFFICE',
        headcount: parseInt(body.headcount) || 1,
        filledCount: parseInt(body.filledCount) || 0,
        status: body.status || 'OPEN',
        budgetMin: body.budgetMin ? parseFloat(body.budgetMin) : null,
        budgetMax: body.budgetMax ? parseFloat(body.budgetMax) : null,
        currency: body.currency || 'INR',
        description: body.description || null,
        requirements: body.requirements || null,
      },
    });
    return NextResponse.json(position, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const position = await prisma.position.update({
      where: { id },
      data: {
        ...data,
        headcount: data.headcount ? parseInt(data.headcount) : undefined,
        filledCount: data.filledCount ? parseInt(data.filledCount) : undefined,
        budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : undefined,
      },
    });
    return NextResponse.json(position);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await prisma.position.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
