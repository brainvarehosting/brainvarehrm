import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;

    if (date) {
      const d = new Date(date);
      where.date = { gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()), lt: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) };
    } else if (month && year) {
      const m = parseInt(month) - 1;
      const y = parseInt(year);
      where.date = { gte: new Date(y, m, 1), lt: new Date(y, m + 1, 1) };
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        shift: { select: { name: true, startTime: true, endTime: true } },
      },
      orderBy: [{ date: 'desc' }, { employee: { firstName: 'asc' } }],
      take: 500,
    });

    // Summary
    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      late: records.filter(r => r.status === 'LATE').length,
      wfh: records.filter(r => r.status === 'WFH').length,
      onLeave: records.filter(r => r.status === 'ON_LEAVE').length,
    };

    return NextResponse.json({ data: records, summary });
  } catch (error: any) {
    console.error('Attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const record = await prisma.attendanceRecord.create({
      data: {
        employeeId: data.employeeId,
        date: new Date(data.date || new Date()),
        clockIn: data.clockIn ? new Date(data.clockIn) : new Date(),
        status: data.status || 'PRESENT',
        source: data.source || 'WEB',
        remarks: data.remarks,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error('Attendance create error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
