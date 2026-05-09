import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const category = searchParams.get('category');

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (category) where.category = category;

    const documents = await prisma.document.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: documents });
  } catch (error: any) {
    console.error('Documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const doc = await prisma.document.create({
      data: {
        employeeId: data.employeeId || null,
        name: data.name,
        category: data.category || 'OTHER',
        fileUrl: data.fileUrl || '',
        fileType: data.fileType || 'pdf',
        isVerified: false,
        uploadedBy: data.uploadedBy || 'admin',
      },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
