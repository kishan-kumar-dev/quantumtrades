import { prisma } from "./prisma";

export type NewOrder = {
  userId: number;
  marketId: number;
  side: "buy" | "sell";
  type: "limit" | "market";
  price?: number;
  quantity: number;
};

export async function placeOrder(order: NewOrder) {
  // 1️⃣ Create the order
  const createdOrder = await prisma.order.create({
    data: {
      userId: order.userId,
      marketId: order.marketId,
      side: order.side,
      type: order.type,
      price: order.price ?? null,
      quantity: order.quantity,
    },
  });

  // 2️⃣ Try to match order
  const oppositeSide = order.side === "buy" ? "sell" : "buy";

  const match = await prisma.order.findFirst({
    where: {
      marketId: order.marketId,
      side: oppositeSide,
      price:
        order.side === "buy"
          ? { lte: order.price ?? 0 }
          : { gte: order.price ?? 0 },
      status: "open",
    },
    orderBy: { createdAt: "asc" },
  });

  if (match) {
    const tradedQuantity = Math.min(order.quantity, match.quantity);
    const trade = await prisma.trade.create({
      data: {
        buyOrderId: order.side === "buy" ? createdOrder.id : match.id,
        sellOrderId: order.side === "sell" ? createdOrder.id : match.id,
        price: match.price ?? order.price ?? 0,
        quantity: tradedQuantity,
        userId: order.userId,
      },
    });

    // Update orders
    await prisma.order.update({
      where: { id: createdOrder.id },
      data: {
        quantity: createdOrder.quantity - tradedQuantity,
        status:
          createdOrder.quantity - tradedQuantity === 0 ? "filled" : "open",
      },
    });

    await prisma.order.update({
      where: { id: match.id },
      data: {
        quantity: match.quantity - tradedQuantity,
        status: match.quantity - tradedQuantity === 0 ? "filled" : "open",
      },
    });
  }

  return createdOrder;
}
