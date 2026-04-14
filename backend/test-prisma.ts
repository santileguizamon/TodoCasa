import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  console.log('Prisma OK');
  await prisma.$disconnect();
}

main();
