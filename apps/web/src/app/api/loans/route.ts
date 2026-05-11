import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0, activeLoans: 0, totalOutstanding: 0 });
    const loans = await prisma.loan.findMany({
      where: { organizationId: orgId },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      data: loans, total: loans.length,
      activeLoans: loans.filter(l => l.status === 'ACTIVE').length,
      totalOutstanding: loans.reduce((s, l) => s + l.outstanding, 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    const body = await request.json();
    const amount = parseFloat(body.amount) || 0;
    const loan = await prisma.loan.create({
      data: {
        organizationId: orgId, employeeId: body.employeeId,
        type: body.type || 'SALARY_ADVANCE', amount, disbursed: 0, repaid: 0, outstanding: amount,
        emi: body.emi ? parseFloat(body.emi) : 0, tenure: parseInt(body.tenure) || 1,
        reason: body.reason || null, status: 'PENDING',
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(loan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const loan = await prisma.loan.update({
      where: { id: body.id },
      data: {
        status: body.status, approvedBy: body.approvedBy || null,
        disbursed: body.disbursed !== undefined ? parseFloat(body.disbursed) : undefined,
        disbursedAt: body.status === 'ACTIVE' ? new Date() : undefined,
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
