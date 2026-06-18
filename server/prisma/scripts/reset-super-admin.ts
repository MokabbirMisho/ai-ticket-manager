import bcrypt from "bcrypt";
import { prisma } from "../../src/config/prisma.js";

const SUPER_ADMIN_EMAIL = "mokabbirmiso1992@gmail.com";
const SUPER_ADMIN_PASSWORD = "Misho1234@";

async function main() {
  const defaultTenant = await prisma.tenant.findUnique({
    where: { slug: "default" },
  });

  if (!defaultTenant) {
    throw new Error('Default tenant with slug "default" not found.');
  }

  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      name: "Mokabbir Misho",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      tenantId: null,
    },
    create: {
      name: "Mokabbir Misho",
      email: SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      isActive: true,
      tenantId: null,
    },
  });

  await prisma.ticket.updateMany({
    where: {
      assignedAgentId: {
        not: null,
      },
    },
    data: {
      assignedAgentId: null,
    },
  });

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      email: {
        not: SUPER_ADMIN_EMAIL,
      },
    },
  });

  console.log("Super Admin ready:", superAdmin.email);
  console.log("Super Admin role:", superAdmin.role);
  console.log("Deleted other users:", deletedUsers.count);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
