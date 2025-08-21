import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { prisma } from "@/lib/prisma";
import { app } from "@/server"; // Replace with actual exported Next.js handler if available

beforeAll(async () => {
  // Reset orders and trades before testing
  await prisma.trade.deleteMany({});
  await prisma.order.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("/api/orders", () => {
  it("GET returns all orders and recent trades", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("orders");
    expect(res.body).toHaveProperty("trades");
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(Array.isArray(res.body.trades)).toBe(true);
  });

  it("POST creates a new order", async () => {
    const res = await request(app).post("/api/orders").send({
      userId: 1, // Seeded user
      marketId: 1, // Seeded market
      side: "buy",
      type: "limit",
      price: 150,
      quantity: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.order).toHaveProperty("id");
    expect(res.body.order.side).toBe("buy");
    expect(res.body.order.type).toBe("limit");
  });

  it("DELETE cancels an existing order", async () => {
    // First, create an order to cancel
    const order = await prisma.order.create({
      data: {
        userId: 1,
        marketId: 1,
        side: "sell",
        type: "limit",
        price: 200,
        quantity: 1,
      },
    });

    const res = await request(app).delete(`/api/orders?id=${order.id}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    // Verify order status updated in DB
    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });
    expect(updatedOrder?.status).toBe("cancelled");
  });

  it("POST fails with invalid input", async () => {
    const res = await request(app).post("/api/orders").send({
      userId: 1,
      side: "buy",
      type: "limit",
      quantity: 2,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid input");
  });

  it("DELETE fails when id is missing", async () => {
    const res = await request(app).delete("/api/orders");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing id");
  });
});
