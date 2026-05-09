import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ data: shifts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const org = await prisma.organization.findFirst();
    const shift = await prisma.shift.create({
      data: { ...data, organizationId: org!.id },
    });
    return NextResponse.json(shift, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
