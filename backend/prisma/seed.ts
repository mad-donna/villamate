import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'dmlehsasd@gmail.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const hashed = await bcrypt.hash('admin1234!', 10);
    await prisma.user.create({
      data: {
        email,
        name: '최고관리자',
        role: 'SUPER_ADMIN',
        provider: 'LOCAL',
        password: hashed,
      },
    });
    console.log('SUPER_ADMIN user created.');
  } else {
    console.log('SUPER_ADMIN user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
