import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0 });

    const programs = await prisma.wellnessProgram.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    const metrics = {
      stressLevel: 3.2,
      satisfactionScore: 4.1,
      workLifeBalance: 3.8,
      wellnessParticipation: programs.length > 0
        ? Math.round((programs.reduce((s, p) => s + p.participants, 0) / (programs.length * 10)) * 100)
        : 0,
    };

    return NextResponse.json({ data: programs, total: programs.length, metrics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const body = await request.json();
    const program = await prisma.wellnessProgram.create({
      data: {
        organizationId: orgId,
        name: body.name,
        type: body.type || 'Fitness',
        description: body.description || null,
        schedule: body.schedule || null,
        status: body.status || 'UPCOMING',
        participants: 0,
      },
    });
    return NextResponse.json(program, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const program = await prisma.wellnessProgram.update({
      where: { id },
      data: {
        status: data.status,
        participants: data.participants !== undefined ? parseInt(data.participants) : undefined,
        name: data.name,
        description: data.description,
        schedule: data.schedule,
      },
    });
    return NextResponse.json(program);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
