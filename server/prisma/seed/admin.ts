import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing from .env");
}

console.log("Using database:", databaseUrl);

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("Admin user ready:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
