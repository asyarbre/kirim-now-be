import { PrismaClient } from '../../../generated/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

interface PermissionData {
  name: string;
  key: string;
  resource: string;
}

export async function seedPermissions(prisma: PrismaClient) {
  console.log('Creating permissions...');

  const permissionsDataPath = join(__dirname, '../data/permissions.json');
  const permissionsDataContent = readFileSync(permissionsDataPath, 'utf-8');
  const permissionsData: { data: PermissionData[] } = JSON.parse(
    permissionsDataContent,
  ) as {
    data: PermissionData[];
  };

  for (const permission of permissionsData.data) {
    const existingPermission = await prisma.permission.findFirst({
      where: { key: permission.key },
    });

    if (!existingPermission) {
      await prisma.permission.create({
        data: {
          name: permission.name,
          key: permission.key,
          resource: permission.resource,
        },
      });
      console.log(`Created permission: ${permission.name}`);
    } else {
      console.log(`Permission already exists: ${permission.name}`);
    }
  }

  console.log(`✅ Processed ${permissionsData.data.length} permissions`);
}
