import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const alumni = await prisma.employee.findMany({
      where: { employmentStatus: 'ALUMNUS' },
      include: {
        department: { select: { name: true } },
        designation: { select: { title: true } },
        grade: { select: { name: true } },
        location: { select: { name: true } },
        exitCase: { select: { exitType: true, exitReason: true, resignationDate: true, lastWorkingDate: true, exitInterviewDone: true, exitInterviewNotes: true, rehireEligible: true, status: true } },
      },
      orderBy: { dateOfExit: 'desc' },
    });
    return NextResponse.json({ data: alumni });
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }
}
