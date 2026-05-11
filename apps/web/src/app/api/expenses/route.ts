import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function GET() {
  try {
    const orgId = await getOrgId();
    if (!orgId) return NextResponse.json({ data: [], total: 0 });

    const expenses = await prisma.expense.findMany({
      where: { organizationId: orgId },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      data: expenses,
      total: expenses.length,
      pending: expenses.filter(e => e.status === 'PENDING').length,
      totalApproved: expenses.filter(e => e.status === 'APPROVED').reduce((s, e) => s + e.amount, 0),
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
    const expense = await prisma.expense.create({
      data: {
        organizationId: orgId,
        employeeId: body.employeeId,
        category: body.category,
        amount: parseFloat(body.amount),
        description: body.description || null,
        receipt: body.receipt ?? false,
        status: 'PENDING',
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const expense = await prisma.expense.update({
      where: { id: body.id },
      data: {
        status: body.status,
        approvedBy: body.approvedBy || undefined,
        approvedAt: body.status === 'APPROVED' ? new Date() : undefined,
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(expense);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
