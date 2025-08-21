import { prisma } from "../lib/prisma.ts";
import { hashPassword } from "../lib/auth.ts";

async function main() {
  // Clear existing data
  await prisma.order.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.market.deleteMany({});

  // Create a market (adjust base/quote according to your schema)
  const demoMarket = await prisma.market.create({
    data: {
      symbol: "DEM",
      base: "USD", // required by your Market model
      quote: "BTC", // required by your Market model
    },
  });

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: "demo@example.com",
      name: "Demo User",
      password: await hashPassword("password123"),
      role: "user",
    },
  });

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password: await hashPassword("admin123"),
      role: "admin",
    },
  });

  // Create orders for demo user
  if (demoUser && demoMarket) {
    await prisma.order.create({
      data: {
        userId: demoUser.id,
        marketId: demoMarket.id,
        side: "buy",
        kind: "limit",
        price: 100,
        quantity: 5,
        remaining: 5,
        status: "open",
      },
    });

    await prisma.order.create({
      data: {
        userId: demoUser.id,
        marketId: demoMarket.id,
        side: "sell",
        kind: "limit",
        price: 110,
        quantity: 3,
        remaining: 3,
        status: "open",
      },
    });
  }

  console.log("✅ Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
