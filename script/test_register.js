import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const email = `test-${Date.now()}@example.com`;
  const fullName = "Test User";
  const password = "password123";
  const degreeProgram = "Computer Engineering"; 
  const batch = "2024";

  const pendingUserStatus = await prisma.userStatus.findFirst({ where: { statusName: 'Pending' } });
  const privateProfileStatus = await prisma.profileStatus.findFirst({ where: { statusName: 'Private' } });
  
  let degreeId = null;
  if (degreeProgram) {
      const degree = await prisma.degree.findFirst({
          where: {
              OR: [
                  { degreeName: { equals: degreeProgram } },
                  { degreeAbbr: { equals: degreeProgram } },
                  { degreeName: { contains: degreeProgram } },
                  { degreeAbbr: { contains: degreeProgram } }
              ]
          }
      });
      if (degree) {
          degreeId = degree.id;
      } else {
          const firstDegree = await prisma.degree.findFirst();
          if (firstDegree) degreeId = firstDegree.id;
      }
  } else {
      const firstDegree = await prisma.degree.findFirst();
      if (firstDegree) degreeId = firstDegree.id;
  }

  let defaultAdmin = await prisma.admin.findFirst();
  if (!defaultAdmin) {
      defaultAdmin = await prisma.admin.create({ data: { passwordHash: 'default' } });
  }

  const userId = uuidv4();
  const passwordHash = "somehash";

  try {
    await prisma.$transaction(async (tx) => {
        // Atomic nested creation
        const newUser = await tx.user.create({
            data: {
                id: userId,
                profileStatusId: privateProfileStatus.id,
                userStatusId: pendingUserStatus.id,
                auth: {
                    create: {
                        email,
                        passwordHash,
                    }
                },
                profile: {
                    create: {
                        userName: fullName,
                        email,
                        degreeId: degreeId,
                        batch: parseInt(batch, 10) || null,
                        profileImage: "http://localhost:3000/engineer.png"
                    }
                },
                statistics: {
                    create: {}
                },
                records: {
                    create: {
                        adminId: defaultAdmin.id,
                        userStatusId: pendingUserStatus.id,
                        description: "User registered",
                    }
                }
            },
            include: {
                records: true
            }
        });
        console.log('1. User and nested relations created.');

        const record = newUser.records[0];

        // Link Record back to User
        await tx.user.update({
            where: { id: userId },
            data: { currentRecordId: record.id }
        });
        console.log('2. Linked currentRecordId back to User.');
    });
    console.log('NESTED TRANSACTION SUCCEEDED!');
  } catch (err) {
    console.error('NESTED TRANSACTION FAILED WITH ERROR:', err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
