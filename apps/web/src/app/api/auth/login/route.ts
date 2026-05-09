import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

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

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create a simple token (in production use JWT)
    const token = crypto.randomBytes(32).toString('hex');

    const userData = {
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
    };

    return NextResponse.json({
      accessToken: token,
      refreshToken: token,
      user: userData,
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
