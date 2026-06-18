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

  const tenant = await prisma.tenant.upsert({
    where: {
      slug: "default",
    },
    update: {},
    create: {
      name: "Default Workspace",
      slug: "default",
    },
  });

  console.log("Default tenant ready:", tenant.slug);

  await prisma.user.updateMany({
    where: {
      tenantId: null,
      role: {
        not: Role.SUPER_ADMIN,
      },
    },
    data: {
      tenantId: tenant.id,
    },
  });

  await prisma.$executeRaw`
    UPDATE "Student"
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;

  await prisma.$executeRaw`
    UPDATE "Ticket"
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;

  await prisma.$executeRaw`
    UPDATE "KnowledgeArticle"
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;

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
      tenantId: tenant.id,
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
