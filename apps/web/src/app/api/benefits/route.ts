import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0 });

    const benefits = await prisma.benefit.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: benefits, total: benefits.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const body = await request.json();
    const benefit = await prisma.benefit.create({
      data: {
        organizationId: orgId,
        name: body.name,
        provider: body.provider || null,
        type: body.type || 'GROUP_MEDICAL',
        coverage: body.coverage ? parseFloat(body.coverage) : null,
        enrolled: parseInt(body.enrolled) || 0,
        premium: body.premium ? parseFloat(body.premium) : null,
        status: body.status || 'ACTIVE',
        renewalDate: body.renewalDate ? new Date(body.renewalDate) : null,
      },
    });
    return NextResponse.json(benefit, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
