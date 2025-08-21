import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const permissions = await this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        key: true,
        resource: true,
      },
    });
    return {
      message: 'Permissions retrieved successfully',
      data: permissions,
    };
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return (
      user.role.rolePermissions.map(
        rolePermission => rolePermission.permission.key,
      ) || []
    );
  }

  async userHasAnyPermission(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some(permissionKey =>
      permissions.includes(permissionKey),
    );
  }

  async userHasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every(permissionKey =>
      userPermissions.includes(permissionKey),
    );
  }
}
