import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const task = await prisma.onboardingTask.update({
      where: { id },
      data: {
        status: data.status,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
      },
    });
    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
