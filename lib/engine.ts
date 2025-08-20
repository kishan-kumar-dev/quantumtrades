import { prisma } from './prisma'
import { Mutex } from 'async-mutex'
import { broadcast } from './events'

export type NewOrder = {
  userId: number
  side: 'buy' | 'sell'
  type: 'limit' | 'market'
  price?: number
  quantity: number
}

const mutex = new Mutex()

/**
 * Very simple price-time matching:
 * - BUY matches the lowest ASK with price <= buy.price (or any for market)
 * - SELL matches the highest BID with price >= sell.price (or any for market)
 * Persists Orders and Trades to SQLite (Prisma).
 * Emits SSE events on updates.
 */
export async function placeOrder(input: NewOrder) {
  return mutex.runExclusive(async () => {
    const order = await prisma.order.create({
      data: {
        userId: input.userId,
        side: input.side,
        type: input.type,
        price: input.type === 'limit' ? input.price! : null,
        quantity: input.quantity,
      }
    })

    let remaining = order.quantity

    while (remaining > 0) {
      const opposite = order.side === 'buy' ? 'sell' : 'buy'
      const book = await prisma.order.findFirst({
        where: {
          side: opposite,
          status: 'open',
          ...(order.type === 'limit'
            ? (order.side === 'buy'
                ? { price: { lte: order.price ?? undefined } }
                : { price: { gte: order.price ?? undefined } })
            : {})
        },
        orderBy: order.side === 'buy'
          ? [{ price: 'asc' as const }, { createdAt: 'asc' as const }]
          : [{ price: 'desc' as const }, { createdAt: 'asc' as const }]
      })

      if (!book) break

      const tradeQty = Math.min(remaining, book.quantity)
      const tradePrice = book.price ?? order.price ?? 0

      // Create trade attributed to taker user (simplified attribution)
      await prisma.trade.create({
        data: {
          buyOrderId: order.side === 'buy' ? order.id : book.id,
          sellOrderId: order.side === 'sell' ? order.id : book.id,
          price: tradePrice,
          quantity: tradeQty,
          userId: order.userId
        }
      })

      // Update the resting order
      const newQty = book.quantity - tradeQty
      await prisma.order.update({
        where: { id: book.id },
        data: {
          quantity: newQty,
          status: newQty === 0 ? 'filled' : 'partial'
        }
      })

      remaining -= tradeQty
    }

    // Update the active order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        quantity: remaining,
        status: remaining === 0 ? 'filled' : (remaining < order.quantity ? 'partial' : 'open')
      }
    })

    const [orders, trades] = await Promise.all([
      prisma.order.findMany({ where: { status: { in: ['open','partial'] } }, orderBy: [{ createdAt: 'asc' }] }),
      prisma.trade.findMany({ orderBy: [{ createdAt: 'desc' }], take: 50 })
    ])

    broadcast('book', { orders })
    broadcast('trades', { trades })

    return { ok: true }
  })
}

export async function cancelOrder(orderId: number, userId: number) {
  return mutex.runExclusive(async () => {
    const ord = await prisma.order.findUnique({ where: { id: orderId } })
    if (!ord || ord.userId !== userId || ord.status !== 'open') {
      return { ok: false, error: 'Cannot cancel this order.' }
    }
    await prisma.order.update({ where: { id: orderId }, data: { status: 'cancelled' } })
    const orders = await prisma.order.findMany({ where: { status: { in: ['open','partial'] } }, orderBy: [{ createdAt: 'asc' }] })
    broadcast('book', { orders })
    return { ok: true }
  })
}
