import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { placeOrder, NewOrder } from "@/lib/engine";
import { prisma } from "@/lib/prisma";
import { broadcast } from "@/lib/events";

// Zod schema for validating order input
const schema = z.object({
  marketId: z.number(),
  side: z.enum(["buy", "sell"]),
  type: z.enum(["limit", "market"]),
  price: z.number().optional(),
  quantity: z.number(),
});

// GET: fetch orders and recent trades
export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "asc" },
  });

  const trades = await prisma.trade.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ orders, trades });
}

// POST: create a new order
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const userId = 1; // placeholder, replace with actual authenticated user

  const { marketId, side, type, price, quantity } = parsed.data;

  const orderData: NewOrder = {
    userId,
    marketId,
    side,
    type,
    price,
    quantity,
  };

  const savedOrder = await placeOrder(orderData);

  // Broadcast updated book and trades
  const allOrders = await prisma.order.findMany({
    where: { status: { in: ["open", "partial"] } },
    orderBy: { createdAt: "asc" },
  });

  const trades = await prisma.trade.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  broadcast("book", { orders: allOrders });
  broadcast("trades", { trades });

  return NextResponse.json({ ok: true, order: savedOrder });
}

// DELETE: cancel an order
export async function DELETE(req: NextRequest) {
  const idParam = new URL(req.url).searchParams.get("id");
  const id = idParam ? Number(idParam) : undefined;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id },
    data: { status: "cancelled" },
  });

  // Broadcast updated book and trades
  const allOrders = await prisma.order.findMany({
    where: { status: { in: ["open", "partial"] } },
    orderBy: { createdAt: "asc" },
  });

  const trades = await prisma.trade.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  broadcast("book", { orders: allOrders });
  broadcast("trades", { trades });

  return NextResponse.json({ ok: true });
}
