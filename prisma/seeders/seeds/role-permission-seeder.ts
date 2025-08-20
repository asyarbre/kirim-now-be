import { PrismaClient } from '../../../generated/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function seedRolePermissions(prisma: PrismaClient) {
  console.log('Creating role permissions...');

  const rolePermissionsDataPath = join(
    __dirname,
    '../data/role-permissions.json',
  );
  const rolePermissionsDataContent = readFileSync(
    rolePermissionsDataPath,
    'utf-8',
  );
  const rolePermissionsData: {
    data: Record<string, string[]>;
  } = JSON.parse(rolePermissionsDataContent) as {
    data: Record<string, string[]>;
  };

  for (const [roleKey, permissionKeys] of Object.entries(
    rolePermissionsData.data,
  )) {
    const role = await prisma.role.findFirst({
      where: { key: roleKey },
    });

    if (!role) {
      console.log(`Role not found: ${roleKey}`);
      continue;
    }

    for (const permissionKey of permissionKeys) {
      const permission = await prisma.permission.findFirst({
        where: { key: permissionKey },
      });

      if (!permission) {
        console.log(`Permission not found: ${permissionKey}`);
        continue;
      }

      const existingRolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });

      if (!existingRolePermission) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
        console.log(`Created role permission: ${roleKey} -> ${permissionKey}`);
      } else {
        console.log(
          `Role permission already exists: ${roleKey} -> ${permissionKey}`,
        );
      }
    }
  }

  console.log('✅ Processed role permissions');
}
