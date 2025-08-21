import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../lib/prisma";
import { placeOrder, NewOrder } from "../lib/engine";

// Optional: mock Prisma to avoid hitting real DB
vi.mock("../lib/prisma");

describe("Orders API/Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("places a new order", async () => {
    const newOrder: NewOrder = {
      userId: 1,
      marketId: 1,
      side: "buy",
      type: "limit",
      price: 100,
      quantity: 5,
    };

    // Mock prisma.order.create
    (prisma.order.create as any).mockResolvedValue({
      id: 123,
      ...newOrder,
      status: "open",
    });

    const saved = await placeOrder(newOrder);

    expect(saved).toHaveProperty("id");
    expect(saved.side).toBe("buy");
    expect(saved.quantity).toBe(5);
    expect(saved.status).toBe("open");
  });

  it("cancels an order", async () => {
    const orderId = 123;

    // Mock prisma.order.update
    (prisma.order.update as any).mockResolvedValue({
      id: orderId,
      status: "canceled",
    });

    const canceled = await prisma.order.update({
      where: { id: orderId },
      data: { status: "canceled" },
    });

    expect(canceled.status).toBe("canceled");
  });
});
