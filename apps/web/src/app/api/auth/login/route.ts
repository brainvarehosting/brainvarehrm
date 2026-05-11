import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { createToken, REFRESH_TTL } from '@/lib/jwt';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
            designation: { select: { title: true } },
            organization: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.passwordHash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      employeeId: user.employeeId,
      organizationId: user.employee?.organization?.id,
    };

    const accessToken = createToken(tokenPayload);
    const refreshToken = createToken({ sub: user.id, type: 'refresh' }, REFRESH_TTL);

    return NextResponse.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
        employeeId: user.employeeId,
        organizationId: user.employee?.organization?.id,
        employee: user.employee ? {
          id: user.employee.id,
          firstName: user.employee.firstName,
          lastName: user.employee.lastName,
          employeeCode: user.employee.employeeCode,
          profilePhoto: user.employee.profilePhoto,
          department: user.employee.department?.name,
          designation: user.employee.designation?.title,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
