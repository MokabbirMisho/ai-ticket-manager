import "dotenv/config";
import bcrypt from "bcrypt";
import {
  PaymentProvider,
  Plan,
  PrismaClient,
  Role,
  SubscriptionStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing from .env");
}

console.log("Using configured database connection");

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const SUPER_ADMIN_EMAIL = "mokabbirmiso1992@gmail.com";
const OLD_SEED_ADMIN_EMAIL = ["admin", "example.com"].join("@");

async function main() {
  const hashedPassword = await bcrypt.hash("Misho1234@", 12);

  const tenant = await prisma.tenant.upsert({
    where: {
      slug: "default",
    },
    update: {
      isActive: true,
      plan: Plan.FREE,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      subscriptionEndsAt: null,
      paymentProvider: PaymentProvider.MANUAL,
    },
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
    UPDATE "Requester"
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

  const superAdmin = await prisma.user.upsert({
    where: {
      email: SUPER_ADMIN_EMAIL,
    },
    update: {
      name: "Super Admin",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
      tenantId: null,
    },
    create: {
      name: "Super Admin",
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
      tenantId: null,
    },
  });

  const oldSeedAdmin = await prisma.user.findUnique({
    where: {
      email: OLD_SEED_ADMIN_EMAIL,
    },
    select: {
      id: true,
      role: true,
      _count: {
        select: {
          assignedTickets: true,
        },
      },
    },
  });

  if (
    oldSeedAdmin &&
    (oldSeedAdmin.role === Role.ADMIN ||
      oldSeedAdmin.role === Role.SUPER_ADMIN) &&
    oldSeedAdmin._count.assignedTickets === 0
  ) {
    await prisma.user.delete({
      where: {
        id: oldSeedAdmin.id,
      },
    });
  }

  console.log("Super admin user ready:", superAdmin.email);
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
