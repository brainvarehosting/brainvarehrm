import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [holidays, leaveTransactions] = await Promise.all([
      prisma.holiday.findMany({
        where: { date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'asc' },
      }),
      prisma.leaveTransaction.findMany({
        where: {
          status: 'APPROVED',
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
        include: {
          employee: { select: { firstName: true, lastName: true, employeeCode: true } },
          leaveType: { select: { name: true, code: true } },
        },
      }),
    ]);

    return NextResponse.json({ holidays, leaves: leaveTransactions, year, month });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
