import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || '';
    const department = searchParams.get('department') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeCode: { contains: search } },
      ];
    }
    if (status) where.employmentStatus = status;
    if (department) where.departmentId = department;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          designation: { select: { id: true, title: true } },
          location: { select: { id: true, name: true, city: true } },
          grade: { select: { id: true, name: true } },
          reportingManager: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { firstName: 'asc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      data: employees,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Employees fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const org = await prisma.organization.findFirst();
    if (!org) return NextResponse.json({ error: 'No organization found' }, { status: 400 });

    // Auto-generate employee code (find max)
    const allCodes = await prisma.employee.findMany({
      select: { employeeCode: true },
      orderBy: { employeeCode: 'desc' },
      take: 1,
    });
    let nextCode = 'EMP-0001';
    if (allCodes.length > 0) {
      const maxNum = parseInt(allCodes[0].employeeCode.replace(/\D/g, '')) || 0;
      nextCode = `EMP-${String(maxNum + 1).padStart(4, '0')}`;
    }

    // Clean empty strings to null for optional fields
    const cleanData: any = { ...data };
    for (const key of Object.keys(cleanData)) {
      if (cleanData[key] === '') cleanData[key] = undefined;
    }

    const employee = await prisma.employee.create({
      data: {
        ...cleanData,
        employeeCode: cleanData.employeeCode || nextCode,
        organizationId: org.id,
        dateOfJoining: new Date(cleanData.dateOfJoining || new Date()),
        dateOfBirth: cleanData.dateOfBirth ? new Date(cleanData.dateOfBirth) : undefined,
        noticePeriodDays: cleanData.noticePeriodDays ? parseInt(cleanData.noticePeriodDays) : 30,
      },
      include: {
        department: true,
        designation: true,
        location: true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    console.error('Employee create error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create employee' }, { status: 500 });
  }
}
