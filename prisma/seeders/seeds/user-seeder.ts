import { PrismaClient } from '../../../generated/prisma';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';

interface UserData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  roleKey: string;
}

export async function seedUsers(prisma: PrismaClient) {
  console.log('Creating users...');

  const usersDataPath = join(__dirname, '../data/users.json');
  const usersDataContent = readFileSync(usersDataPath, 'utf-8');
  const usersData: { data: UserData[] } = JSON.parse(usersDataContent) as {
    data: UserData[];
  };

  for (const user of usersData.data) {
    const role = await prisma.role.findFirst({
      where: { key: user.roleKey },
    });

    if (!role) {
      console.log(`Role not found: ${user.roleKey}`);
      continue;
    }

    const existingUser = await prisma.user.findFirst({
      where: { email: user.email },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          phoneNumber: user.phoneNumber,
          roleId: role.id,
        },
      });
      console.log(`Created user: ${user.name} (${user.email})`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  console.log(`✅ Processed ${usersData.data.length} users`);
}
