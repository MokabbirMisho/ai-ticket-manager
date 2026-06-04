import { prisma } from "../config/prisma.js";

async function main() {
  const user = await prisma.user.update({
    where: {
      email: "mokabbirmiso1992@gmail.com",
    },
    data: {
      name: "System Admin",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  console.log("Updated user:");
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
