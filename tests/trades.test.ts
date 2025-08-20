import { describe, it, expect, beforeAll } from 'vitest'
import { prisma } from '../lib/prisma'
import { placeOrder } from '../lib/engine'

describe('Trades', () => {
  beforeAll(async () => {
    // Disable foreign key checks temporarily
    await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`

    // Delete dependent tables in correct order
    await prisma.trade.deleteMany()
    await prisma.order.deleteMany()
    await prisma.user.deleteMany()

    // Re-enable foreign key checks
    await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
  })

  it('creates a trade when buy and sell match', async () => {
    const u1 = await prisma.user.upsert({
      where: { email: 't1@test.com' },
      update: {},
      create: { email: 't1@test.com', name: 'T1', password: 'x', role: 'trader' }
    })

    const u2 = await prisma.user.upsert({
      where: { email: 't2@test.com' },
      update: {},
      create: { email: 't2@test.com', name: 'T2', password: 'x', role: 'trader' }
    })

    await placeOrder({ userId: u1.id, side: 'sell', type: 'limit', price: 50, quantity: 1 })
    await placeOrder({ userId: u2.id, side: 'buy', type: 'limit', price: 60, quantity: 1 })

    const trades = await prisma.trade.findMany()
    expect(trades.length).toBeGreaterThan(0)
  })
})
