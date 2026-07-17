const { PrismaClient } = require("./prisma/generated/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const adapter = new PrismaBetterSqlite3({
    url: "./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: { userStatus: true }
  });
  console.log("User statuses:", Array.from(new Set(users.map(u => u.userStatus.statusName))));

  const bulletins = await prisma.bulletin.findMany({
    include: {
      author: {
        include: { userStatus: true }
      }
    }
  });
  console.log("Bulletin authors user statuses:", Array.from(new Set(bulletins.map(b => b.author?.userStatus?.statusName))));
}
main().finally(() => prisma.$disconnect());
