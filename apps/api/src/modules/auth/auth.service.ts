import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, AuthResponse } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        roles: {
          include: { role: true },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhoto: true,
            organizationId: true,
            employeeCode: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException(
        'Account is locked. Please try again later.',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Track failed attempts
      const attempts = user.failedAttempts + 1;
      const updates: any = { failedAttempts: attempts };

      // Lock after 5 failed attempts for 30 minutes
      if (attempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        updates.failedAttempts = 0;
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updates,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: undefined,
      },
    });

    const roles = user.roles.map((ur: any) => ur.role.name);
    const payload = {
      sub: user.id,
      email: user.email,
      employeeId: user.employeeId,
      organizationId: user.employee?.organizationId,
      roles,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      },
    );

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        entityType: 'User',
        entityId: user.id,
        action: 'LOGIN',
        performedBy: user.id,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        employeeId: user.employeeId || undefined,
        firstName: user.employee?.firstName,
        lastName: user.employee?.lastName,
        roles,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  async refreshToken(
    refreshTokenValue: string,
  ): Promise<{ accessToken: string }> {
    try {
      const decoded = this.jwtService.verify(refreshTokenValue, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        include: {
          roles: { include: { role: true } },
          employee: {
            select: { organizationId: true },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const roles = user.roles.map((ur: any) => ur.role.name);
      const payload = {
        sub: user.id,
        email: user.email,
        employeeId: user.employeeId,
        organizationId: user.employee?.organizationId,
        roles,
        isSuperAdmin: user.isSuperAdmin,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
      });

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            organizationId: true,
            employeeCode: true,
            profilePhoto: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      employeeId: user.employeeId,
      employee: user.employee,
      organizationId: user.employee?.organizationId,
      roles: user.roles.map((ur: any) => ur.role.name),
      isSuperAdmin: user.isSuperAdmin,
    };
  }

  async createInitialAdmin(
    email: string,
    password: string,
    organizationId: string,
  ) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create employee record for admin
    const employee = await this.prisma.employee.create({
      data: {
        employeeCode: 'EMP-0001',
        firstName: 'Super',
        lastName: 'Admin',
        email,
        dateOfJoining: new Date(),
        employmentStatus: 'ACTIVE',
        organizationId,
      },
    });

    // Ensure SUPER_ADMIN role exists
    let adminRole = await this.prisma.role.findUnique({
      where: { name: 'SUPER_ADMIN' },
    });

    if (!adminRole) {
      adminRole = await this.prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          displayName: 'Super Admin',
          description: 'Full system access',
          permissions: {},
          isSystem: true,
        },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        employeeId: employee.id,
        isSuperAdmin: true,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });

    return user;
  }
}
