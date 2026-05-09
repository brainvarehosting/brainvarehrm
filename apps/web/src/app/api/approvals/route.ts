import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [pendingLeaves, pendingOnboarding, pendingExit] = await Promise.all([
      prisma.leaveTransaction.findMany({
        where: { status: 'PENDING' },
        include: {
          employee: { select: { firstName: true, lastName: true, employeeCode: true, department: { select: { name: true } } } },
          leaveType: { select: { name: true, code: true } },
        },
        orderBy: { appliedAt: 'desc' },
      }),
      prisma.onboardingTask.findMany({
        where: { status: 'PENDING' },
        include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
      }),
      prisma.clearanceTask.findMany({
        where: { status: 'PENDING' },
        include: {
          exitCase: {
            include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
          },
        },
      }),
    ]);

    return NextResponse.json({
      pendingLeaves,
      pendingOnboarding,
      pendingExit,
      summary: {
        leaves: pendingLeaves.length,
        onboarding: pendingOnboarding.length,
        exit: pendingExit.length,
        total: pendingLeaves.length + pendingOnboarding.length + pendingExit.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
