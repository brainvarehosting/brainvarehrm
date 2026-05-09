import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const run = await prisma.payrollRun.update({
      where: { id },
      data: {
        status,
        processedAt: ['LOCKED', 'PAID'].includes(status) ? new Date() : undefined,
      },
    });
    return NextResponse.json(run);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
