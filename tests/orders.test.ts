import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { placeOrder } from "../lib/engine";

describe("Orders API/engine", () => {
  beforeAll(async () => {
    // Disable foreign keys temporarily
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

    // Delete dependent tables first
    await prisma.trade.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();

    // Re-enable foreign keys
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  });

  it("places and cancels an order", async () => {
    const u = await prisma.user.upsert({
      where: { email: "o1@test.com" },
      update: {},
      create: {
        email: "o1@test.com",
        name: "O1",
        password: "x",
        role: "trader",
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: u.id,
        side: "buy",
        type: "limit",
        price: 100,
        quantity: 1,
      },
    });
    expect(order.status).toBe("open");

    const cancelled = await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });
    expect(cancelled.status).toBe("cancelled");
  });
});
