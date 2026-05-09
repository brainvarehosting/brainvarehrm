import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    const where: any = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;

    const transactions = await prisma.leaveTransaction.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, profilePhoto: true } },
        leaveType: { select: { name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Get leave types
    const leaveTypes = await prisma.leaveType.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true, annualQuota: true },
    });

    return NextResponse.json({ data: transactions, leaveTypes });
  } catch (error: any) {
    console.error('Leave error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaves' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const transaction = await prisma.leaveTransaction.create({
      data: {
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        days: data.days,
        reason: data.reason,
        status: 'PENDING',
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        leaveType: { select: { name: true } },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('Leave create error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
