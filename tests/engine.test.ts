import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { placeOrder } from "../lib/engine";

describe("matching engine", () => {
  beforeAll(async () => {
    // Disable foreign keys temporarily (SQLite specific)
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;

    // Delete dependent tables first
    await prisma.trade.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();

    // Re-enable foreign keys
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
  });

  it("matches a buy with a sell", async () => {
    // create resting SELL
    const user = await prisma.user.upsert({
      where: { email: "a@a.com" },
      update: {},
      create: { email: "a@a.com", name: "A", password: "x", role: "trader" },
    });

    await prisma.order.create({
      data: {
        userId: user.id,
        side: "sell",
        type: "limit",
        price: 100,
        quantity: 1,
      },
    });

    const taker = await prisma.user.upsert({
      where: { email: "b@b.com" },
      update: {},
      create: { email: "b@b.com", name: "B", password: "x", role: "trader" },
    });

    await placeOrder({
      userId: taker.id,
      side: "buy",
      type: "limit",
      price: 120,
      quantity: 1,
    });

    const trades = await prisma.trade.findMany();
    expect(trades.length).toBeGreaterThan(0);
  });
});
