import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "demo@quantumtrades.com" },
    update: {},
    create: {
      email: "demo@quantumtrades.com",
      name: "Demo User",
      password: hashedPassword,
      role: "trader",
    },
  });

  await prisma.market.upsert({
    where: { symbol: "BTCUSD" },
    update: {},
    create: {
      symbol: "BTCUSD",
      name: "Bitcoin / USD",
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
