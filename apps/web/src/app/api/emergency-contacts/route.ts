import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const contact = await prisma.emergencyContact.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        relationship: data.relationship || '',
        phone: data.phone,
        isPrimary: data.isPrimary || false,
      },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    console.error('Emergency contact create error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
