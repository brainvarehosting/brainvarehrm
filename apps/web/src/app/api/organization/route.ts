import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst({
      include: {
        departments: { where: { isActive: true }, orderBy: { name: 'asc' } },
        locations: { where: { isActive: true } },
        designations: { where: { isActive: true }, orderBy: { title: 'asc' } },
        grades: { where: { isActive: true }, orderBy: { level: 'asc' } },
        shifts: { where: { isActive: true } },
        leaveTypes: { where: { isActive: true } },
        holidays: { orderBy: { date: 'asc' } },
      },
    });

    if (!org) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
  }
}
