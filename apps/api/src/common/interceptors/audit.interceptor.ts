import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit write operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        try {
          const user = request.user;
          if (!user) return;

          const action = this.getAction(method);
          const entityType =
            context.getClass().name.replace('Controller', '') || 'Unknown';

          await this.prisma.auditLog.create({
            data: {
              entityType,
              entityId: data?.id || request.params?.id || 'unknown',
              action,
              changes: method === 'DELETE' ? null : request.body,
              performedBy: user.id,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            },
          });
        } catch (error) {
          // Don't fail the request if audit logging fails
          console.error('Audit log error:', error);
        }
      }),
    );
  }

  private getAction(method: string): string {
    switch (method) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return method;
    }
  }
}
