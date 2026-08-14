import 'dotenv/config';
import { PrismaClient } from './prisma/generated/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

async function main() {
  const connectionString = process.env.DATABASE_URL.replace('file:', '');
  const sqlite = new Database(connectionString);
  const adapter = new PrismaBetterSqlite3(sqlite);
  const prisma = new PrismaClient({ adapter });

  console.log("Connecting...");
  const users = await prisma.user.findMany({ take: 1 });
  console.log("Success! Found users:", users.length);
}

main().catch(console.error);
