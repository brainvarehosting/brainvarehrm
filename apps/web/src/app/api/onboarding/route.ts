import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const tasks = await prisma.onboardingTask.findMany({
      where,
      include: {
        employee: { select: { firstName: true, lastName: true, employeeCode: true, dateOfJoining: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
    return NextResponse.json({ data: tasks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const task = await prisma.onboardingTask.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
