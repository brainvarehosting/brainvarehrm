import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const policies = await prisma.policy.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ data: policies });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const org = await prisma.organization.findFirst();
    const policy = await prisma.policy.create({
      data: { ...data, organizationId: org!.id, isActive: true, version: 1 },
    });
    return NextResponse.json(policy, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
