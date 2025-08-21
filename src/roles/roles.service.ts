import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
        key: true,
        rolePermissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                key: true,
                resource: true,
              },
            },
          },
        },
      },
    });
    return {
      message: 'Roles retrieved successfully',
      data: roles.map(role => ({
        id: role.id,
        name: role.name,
        key: role.key,
        permissions: role.rolePermissions.map(rp => rp.permission),
      })),
    };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        key: true,
        rolePermissions: {
          select: {
            permission: {
              select: {
                id: true,
                name: true,
                key: true,
                resource: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      message: 'Role retrieved successfully',
      data: {
        id: role.id,
        name: role.name,
        key: role.key,
        permissions: role.rolePermissions.map(rp => rp.permission),
      },
    };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const roleExists = await this.prisma.role.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!roleExists) {
      throw new NotFoundException('Role not found');
    }

    // Check if all permission_ids exist
    if (updateRoleDto.permission_ids.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: updateRoleDto.permission_ids } },
        select: { id: true },
      });

      const foundIds = permissions.map(p => p.id);
      const notFoundIds = updateRoleDto.permission_ids.filter(
        pid => !foundIds.includes(pid),
      );

      if (notFoundIds.length > 0) {
        throw new NotFoundException(
          `Permissions not found: ${notFoundIds.join(', ')}`,
        );
      }
    }

    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    if (updateRoleDto.permission_ids.length > 0) {
      const rolePermissions = updateRoleDto.permission_ids.map(
        permissionId => ({
          roleId: id,
          permissionId,
        }),
      );

      await this.prisma.rolePermission.createMany({
        data: rolePermissions,
        skipDuplicates: true,
      });
    }

    return {
      message: 'Role updated successfully',
    };
  }
}
