import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { placeOrder } from "../lib/engine";

describe("Matching Engine", () => {
  let marketId: number;

  beforeAll(async () => {
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF`;
    await prisma.trade.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.market.deleteMany();

    // Create a market to use in tests
    const market = await prisma.market.create({
      data: { symbol: "BTCUSD", name: "Bitcoin / USD" },
    });
    marketId = market.id;

    await prisma.$executeRaw`PRAGMA foreign_keys = ON`;
  });

  it("places a new order correctly", async () => {
    const user = await prisma.user.upsert({
      where: { email: "o1@test.com" },
      update: {},
      create: {
        email: "o1@test.com",
        name: "O1",
        password: "x",
        role: "trader",
      },
    });

    const order = await placeOrder({
      userId: user.id,
      marketId,
      side: "buy",
      type: "limit",
      price: 100,
      quantity: 1,
    });

    expect(order.status).toBe("open");

    // Cancel the order
    const cancelled = await prisma.order.update({
      where: { id: order.id },
      data: { status: "cancelled" },
    });

    expect(cancelled.status).toBe("cancelled");
  });
});
