const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res1 = await prisma.userConnection.findMany({
      where: {
        status: { connectionName: "Requested" }
      }
    });
    console.log("res1 success");
  } catch (err) {
    console.error("res1 error:", err.message);
  }

  try {
    const res2 = await prisma.userConnection.findMany({
      where: {
        status: { is: { connectionName: "Requested" } }
      }
    });
    console.log("res2 success");
  } catch (err) {
    console.error("res2 error:", err.message);
  }
}
main().finally(() => prisma.$disconnect());
