import { PrismaClient } from '../../generated/prisma';
import { seedRoles } from './seeds/role-seeder';
import { seedPermissions } from './seeds/permission-seeder';
import { seedRolePermissions } from './seeds/role-permission-seeder';
import { seedUsers } from './seeds/user-seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  try {
    // Seed in order due to foreign key dependencies
    console.log('📝 Seeding permissions...');
    await seedPermissions(prisma);

    console.log('👥 Seeding roles...');
    await seedRoles(prisma);

    console.log('🔑 Seeding role permissions...');
    await seedRolePermissions(prisma);

    console.log('👤 Seeding users...');
    await seedUsers(prisma);

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
