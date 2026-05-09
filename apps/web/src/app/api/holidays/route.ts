import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const holidays = await prisma.holiday.findMany({ orderBy: { date: 'asc' } });
    return NextResponse.json({ data: holidays });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const org = await prisma.organization.findFirst();
    const holiday = await prisma.holiday.create({
      data: { ...data, date: new Date(data.date), organizationId: org!.id },
    });
    return NextResponse.json(holiday, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
