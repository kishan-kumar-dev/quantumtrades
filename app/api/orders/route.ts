export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { placeOrder, NewOrder } from "@/lib/engine";
import { z } from "zod";

// Zod schema to validate request body
const placeSchema = z.object({
  side: z.enum(["buy", "sell"]),
  type: z.enum(["limit", "market"]),
  price: z.number().positive().optional(),
  quantity: z.number().positive(),
});

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifyJWT(token);

  const [orders, myOrders] = await Promise.all([
    prisma.order.findMany({
      where: { status: { in: ["open", "partial"] } },
      orderBy: [{ createdAt: "asc" }],
    }),
    prisma.order.findMany({
      where: { userId: Number(user.sub) },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    }),
  ]);

  return NextResponse.json({ orders, myOrders });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifyJWT(token);

  const body = await req.json();
  const parsed = placeSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );

  // Type-safe assignment: ensure all required properties exist
  const orderData: NewOrder = {
    userId: Number(user.sub),
    side: parsed.data.side,
    type: parsed.data.type,
    quantity: parsed.data.quantity,
    price: parsed.data.price, // optional
  };

  await placeOrder(orderData);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await verifyJWT(token);

  const id = Number(new URL(req.url).searchParams.get("id") || 0);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const ord = await prisma.order.findUnique({ where: { id } });
  if (!ord || ord.userId !== Number(user.sub))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.order.update({ where: { id }, data: { status: "cancelled" } });
  return NextResponse.json({ ok: true });
}
