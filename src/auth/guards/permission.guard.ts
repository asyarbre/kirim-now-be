/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/permissions/decorators/permissions.decorator';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No permissions required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (typeof requiredPermissions === 'object' && requiredPermissions.type) {
      const { type, permissions } = requiredPermissions;

      let hasPermission = false;

      if (type === 'any') {
        hasPermission = await this.permissionsService.userHasAnyPermission(
          user.id,
          permissions,
        );
      } else if (type === 'all') {
        hasPermission = await this.permissionsService.userHasAllPermissions(
          user.id,
          permissions,
        );
      }

      if (!hasPermission) {
        throw new ForbiddenException(
          `Access denied. Required permissions: ${permissions.join(', ')}`,
        );
      }
    } else {
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasPermission = await this.permissionsService.userHasAllPermissions(
        user.id,
        permissions,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Access denied. Required permissions: ${permissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
