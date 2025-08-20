import { PrismaClient } from '../../../generated/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';

interface RoleData {
  name: string;
  key: string;
}

export async function seedRoles(prisma: PrismaClient) {
  console.log('Creating roles...');

  const rolesDataPath = join(__dirname, '../data/roles.json');
  const rolesDataContent = readFileSync(rolesDataPath, 'utf-8');
  const rolesData: { data: RoleData[] } = JSON.parse(rolesDataContent) as {
    data: RoleData[];
  };

  for (const role of rolesData.data) {
    const existingRole = await prisma.role.findFirst({
      where: { key: role.key },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: {
          name: role.name,
          key: role.key,
        },
      });
      console.log(`Created role: ${role.name}`);
    } else {
      console.log(`Role already exists: ${role.name}`);
    }
  }

  console.log(`✅ Processed ${rolesData.data.length} roles`);
}
