import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  console.log('--- Admins ---');
  const admins = await prisma.admin.findMany();
  console.log(admins);

  console.log('--- User Statuses ---');
  const userStatuses = await prisma.userStatus.findMany();
  console.log(userStatuses);

  console.log('--- Profile Statuses ---');
  const profileStatuses = await prisma.profileStatus.findMany();
  console.log(profileStatuses);
}

main().catch(console.error).finally(() => prisma.$disconnect());
