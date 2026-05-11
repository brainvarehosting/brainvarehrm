import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const addresses = await prisma.employeeAddress.findMany({
      where: employeeId ? { employeeId } : undefined,
      orderBy: { type: 'asc' },
    });
    return NextResponse.json({ data: addresses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const address = await prisma.employeeAddress.create({
      data: {
        employeeId: data.employeeId,
        type: data.type || 'CURRENT',
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        country: data.country || 'India',
        pincode: data.pincode,
      },
    });
    return NextResponse.json(address, { status: 201 });
  } catch (error: any) {
    console.error('Address create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
