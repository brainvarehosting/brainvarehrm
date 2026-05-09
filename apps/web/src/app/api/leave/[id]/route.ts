import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, rejectionReason } = await request.json();

    if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const transaction = await prisma.leaveTransaction.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
        approvedBy: status === 'APPROVED' ? 'admin' : undefined,
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
        leaveType: { select: { name: true } },
      },
    });

    // Update leave balance if approved
    if (status === 'APPROVED') {
      await prisma.leaveBalance.updateMany({
        where: {
          employeeId: transaction.employeeId,
          leaveTypeId: transaction.leaveTypeId,
          year: new Date().getFullYear(),
        },
        data: {
          taken: { increment: transaction.days },
          closing: { decrement: transaction.days },
        },
      });
    }

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Leave update error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
