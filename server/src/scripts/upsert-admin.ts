import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";

async function main() {
  const email = "mokabbirmiso1992@gmail.com";
  const password = "Admin123@";
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name: "Mokabbir",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Mokabbir",
      email,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  console.log("Admin account ready:");
  console.log(admin);
  console.log("Login password:", password);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
