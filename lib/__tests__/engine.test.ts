import { describe, it, expect, beforeEach } from "vitest";
import { placeOrder } from "../engine";
import { prisma } from "../prisma";

beforeEach(async () => {
  // Clear previous data
  await prisma.trade.deleteMany();
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.market.deleteMany();
});

describe("placeOrder", () => {
  it("creates a new order correctly", async () => {
    // Create a user
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "trader",
      },
    });

    // Create a market
    const market = await prisma.market.create({
      data: {
        symbol: "BTCUSD",
        name: "Bitcoin / USD",
      },
    });

    // Place order
    const order = {
      userId: user.id,
      marketId: market.id,
      side: "buy" as const,
      type: "limit" as const,
      price: 100,
      quantity: 5,
    };

    const saved = await placeOrder(order);

    expect(saved).toHaveProperty("id");
    expect(saved.userId).toBe(user.id);
    expect(saved.marketId).toBe(market.id);
    expect(saved.side).toBe("buy");
    expect(saved.quantity).toBe(5);
  });
});
