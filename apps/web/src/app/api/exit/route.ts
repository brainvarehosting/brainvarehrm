import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cases = await prisma.exitCase.findMany({
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, email: true, department: { select: { name: true } }, designation: { select: { title: true } } } },
        clearanceTasks: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data: cases });
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const exitCase = await prisma.exitCase.create({
      data: {
        employeeId: data.employeeId,
        exitType: data.exitType || 'RESIGNATION',
        exitReason: data.exitReason || data.reason || '',
        resignationDate: new Date(data.resignationDate || new Date()),
        lastWorkingDate: data.lastWorkingDate ? new Date(data.lastWorkingDate) : null,
        status: 'INITIATED',
      },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        clearanceTasks: true,
      },
    });
    // Auto-create clearance tasks
    const departments = ['HR', 'IT', 'ADMIN', 'FINANCE'];
    const titles: Record<string, string> = { HR: 'HR clearance - final settlement', IT: 'IT clearance - return equipment & revoke access', ADMIN: 'Admin clearance - ID card & access card', FINANCE: 'Finance clearance - pending reimbursements' };
    for (const dept of departments) {
      await prisma.clearanceTask.create({ data: { exitCaseId: exitCase.id, department: dept, title: titles[dept] || `${dept} clearance`, status: 'PENDING' } });
    }
    // Update employee status
    await prisma.employee.update({ where: { id: data.employeeId }, data: { employmentStatus: 'NOTICE_PERIOD' } });
    // Refetch with tasks
    const full = await prisma.exitCase.findUnique({ where: { id: exitCase.id }, include: { employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } }, clearanceTasks: true } });
    return NextResponse.json(full, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    // Clearance task update
    if (data.clearanceTaskId) {
      const updated = await prisma.clearanceTask.update({ where: { id: data.clearanceTaskId }, data: { status: data.status, clearedAt: data.status === 'CLEARED' ? new Date() : null } });
      return NextResponse.json(updated);
    }
    // Exit case update
    const { id, ...updates } = data;
    const cleanUpdates: any = {};
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.exitInterviewDone !== undefined) cleanUpdates.exitInterviewDone = updates.exitInterviewDone;
    if (updates.exitInterviewNotes !== undefined) cleanUpdates.exitInterviewNotes = updates.exitInterviewNotes;
    if (updates.rehireEligible !== undefined) cleanUpdates.rehireEligible = updates.rehireEligible;
    if (updates.lastWorkingDate) cleanUpdates.lastWorkingDate = new Date(updates.lastWorkingDate);

    const updated = await prisma.exitCase.update({
      where: { id },
      data: cleanUpdates,
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } }, clearanceTasks: true },
    });

    // If completed, update employee status to ALUMNUS
    if (updates.status === 'COMPLETED') {
      await prisma.employee.update({ where: { id: updated.employeeId }, data: { employmentStatus: 'ALUMNUS', dateOfExit: new Date() } });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
