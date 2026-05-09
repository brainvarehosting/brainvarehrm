import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, isSuperAdmin: true, employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json({ organization: org, users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (data.target === 'organization') {
      const org = await prisma.organization.findFirst();
      const updated = await prisma.organization.update({
        where: { id: org!.id },
        data: { name: data.name, legalName: data.legalName, timezone: data.timezone, currency: data.currency },
      });
      return NextResponse.json(updated);
    }
    if (data.target === 'user' && data.userId) {
      const updated = await prisma.user.update({
        where: { id: data.userId },
        data: { role: data.role },
      });
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
