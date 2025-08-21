import { Mutex } from "async-mutex";
import { prisma } from "./prisma";
import { pubsub } from "./pubsub";

export type OrderSide = "buy" | "sell";
export type OrderKind = "limit" | "market";

export type NewOrder = {
  userId: number;
  marketId: number;
  side: OrderSide;
  kind: OrderKind;
  price?: number;
  quantity: number;
};

const mutex = new Mutex();

export async function placeOrder(payload: NewOrder) {
  return mutex.runExclusive(async () => {
    // persist the incoming order as 'open'
    const order = await prisma.order.create({
      data: {
        userId: payload.userId,
        marketId: payload.marketId,
        side: payload.side,
        kind: payload.kind,
        price: payload.price ?? null,
        quantity: payload.quantity,
        remaining: payload.quantity,
        status: "open",
      },
    });

    let remaining = order.remaining;
    const tradesCreated: any[] = [];

    // Helper: query orderbook only within the same market
    async function fetchBook() {
      if (payload.side === "buy") {
        // Buy wants cheapest sell
        return prisma.order.findMany({
          where: {
            status: "open",
            side: "sell",
            marketId: payload.marketId,
          },
          orderBy: [{ price: "asc" }, { createdAt: "asc" }],
        });
      } else {
        // Sell wants highest buy
        return prisma.order.findMany({
          where: {
            status: "open",
            side: "buy",
            marketId: payload.marketId,
          },
          orderBy: [{ price: "desc" }, { createdAt: "asc" }],
        });
      }
    }

    let book = await fetchBook();

    for (const match of book) {
      if (remaining <= 0) break;

      // Check price rules
      if (order.kind === "limit" && match.kind === "limit") {
        if (order.side === "buy" && (order.price ?? 0) < (match.price ?? 0)) {
          continue;
        }
        if (order.side === "sell" && (order.price ?? 0) > (match.price ?? 0)) {
          continue;
        }
      }

      const tradedQty = Math.min(remaining, match.remaining);
      if (tradedQty <= 0) continue;

      const tradePrice = match.price ?? order.price ?? 0;

      // create trade
      const trade = await prisma.trade.create({
        data: {
          price: tradePrice,
          quantity: tradedQty,
          buyOrderId: order.side === "buy" ? order.id : match.id,
          sellOrderId: order.side === "sell" ? order.id : match.id,
          userId: order.userId,
        },
      });
      tradesCreated.push(trade);

      // update matched order
      await prisma.order.update({
        where: { id: match.id },
        data: {
          remaining: match.remaining - tradedQty,
          status: match.remaining - tradedQty <= 0 ? "filled" : "open",
        },
      });

      remaining -= tradedQty;
      pubsub.emit("trade", trade);
    }

    // update our incoming order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        remaining,
        status: remaining <= 0 ? "filled" : "open",
      },
    });

    const finalOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });

    // broadcast updates
    pubsub.emit("order", finalOrder);
    pubsub.emit("book", { marketId: payload.marketId });

    return { order: finalOrder, trades: tradesCreated };
  });
}

export async function cancelOrder(orderId: number, userId: number) {
  return mutex.runExclusive(async () => {
    const ord = await prisma.order.findUnique({ where: { id: orderId } });
    if (!ord) throw new Error("Order not found");
    if (ord.userId !== userId) throw new Error("Not allowed");
    if (ord.status !== "open") throw new Error("Cannot cancel non-open order");

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "cancelled", remaining: 0 },
    });

    const updated = await prisma.order.findUnique({ where: { id: orderId } });
    pubsub.emit("order", updated);
    pubsub.emit("book", { marketId: updated?.marketId });
    return updated;
  });
}
