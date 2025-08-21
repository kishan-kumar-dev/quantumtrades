import { describe, it, expect, beforeAll } from "vitest";
import { prisma } from "../lib/prisma";
import { placeOrder } from "../lib/engine";

describe("Trades", () => {
  let marketId: number;
  let sellerId: number;
  let buyerId: number;

  beforeAll(async () => {
    // Clear tables
    await prisma.trade.deleteMany();
    await prisma.order.deleteMany();
    await prisma.user.deleteMany();
    await prisma.market.deleteMany();

    // Create a market
    const market = await prisma.market.create({
      data: { symbol: "BTCUSD", name: "Bitcoin / USD" },
    });
    marketId = market.id;

    // Create users
    const seller = await prisma.user.create({
      data: {
        email: "seller@test.com",
        name: "Seller",
        password: "x",
        role: "trader",
      },
    });
    sellerId = seller.id;

    const buyer = await prisma.user.create({
      data: {
        email: "buyer@test.com",
        name: "Buyer",
        password: "x",
        role: "trader",
      },
    });
    buyerId = buyer.id;
  });

  it("creates a trade when buy and sell orders match", async () => {
    // Place sell order
    await placeOrder({
      userId: sellerId,
      marketId,
      side: "sell",
      type: "limit",
      price: 50,
      quantity: 1,
    });

    // Place buy order
    await placeOrder({
      userId: buyerId,
      marketId,
      side: "buy",
      type: "limit",
      price: 60,
      quantity: 1,
    });

    // Verify trade creation (if your engine automatically matches)
    const trades = await prisma.trade.findMany();
    expect(trades.length).toBeGreaterThan(0);

    // Optional: check trade details
    const trade = trades[0];
    expect(trade.price).toBeGreaterThan(0);
    expect(trade.quantity).toBe(1);
  });
});
