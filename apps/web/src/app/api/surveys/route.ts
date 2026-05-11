import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0 });

    const surveys = await prisma.survey.findMany({
      where: { organizationId: orgId },
      include: { _count: { select: { responses: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const data = surveys.map(s => ({
      ...s,
      responses: s._count.responses,
      responseRate: s.totalTargeted > 0 ? Math.round((s._count.responses / s.totalTargeted) * 100) : 0,
    }));

    return NextResponse.json({ data, total: surveys.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const body = await request.json();
    const survey = await prisma.survey.create({
      data: {
        organizationId: orgId,
        title: body.title,
        description: body.description || null,
        anonymous: body.anonymous ?? true,
        status: 'DRAFT',
        deadline: body.deadline ? new Date(body.deadline) : null,
        totalTargeted: parseInt(body.totalTargeted) || 0,
      },
    });
    return NextResponse.json(survey, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const survey = await prisma.survey.update({
      where: { id },
      data: {
        status: data.status,
        title: data.title,
        totalTargeted: data.totalTargeted !== undefined ? parseInt(data.totalTargeted) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });
    return NextResponse.json(survey);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
