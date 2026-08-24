import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { createOrdersForCart, CheckoutError } from '@/lib/checkout'

// Integration tests against the DATABASE_URL Postgres (see vitest.config.ts /
// the CI service). They exercise the transactional checkout: atomic stock
// decrement, per-tenant splitting, and input validation.

const db = new PrismaClient()

async function seedTenantWithProduct(stock: number | null, price = 100) {
  const suffix = Math.random().toString(36).slice(2, 8)
  const tenant = await db.tenant.create({
    data: { name: `T-${suffix}`, slug: `t-${suffix}` },
  })
  const product = await db.product.create({
    data: {
      tenantId: tenant.id,
      title: `P-${suffix}`,
      slug: `p-${suffix}`,
      price,
      stock,
    },
  })
  return { tenant, product }
}

let consumerId: string

beforeEach(async () => {
  const suffix = Math.random().toString(36).slice(2, 8)
  const consumer = await db.user.create({
    data: { email: `c-${suffix}@test.com`, name: 'Test' },
  })
  consumerId = consumer.id
})

afterAll(async () => {
  await db.$disconnect()
})

describe('createOrdersForCart', () => {
  it('creates an order and decrements stock', async () => {
    const { product } = await seedTenantWithProduct(10)
    const ids = await createOrdersForCart(db, consumerId, [{ id: product.id, quantity: 3 }])

    expect(ids).toHaveLength(1)
    const fresh = await db.product.findUniqueOrThrow({ where: { id: product.id } })
    expect(fresh.stock).toBe(7)

    const order = await db.order.findUniqueOrThrow({
      where: { id: ids[0] },
      include: { items: true },
    })
    expect(order.items[0].quantity).toBe(3)
    expect(Number(order.total)).toBe(300)
  })

  it('rejects and rolls back when stock is insufficient', async () => {
    const { product } = await seedTenantWithProduct(2)
    await expect(
      createOrdersForCart(db, consumerId, [{ id: product.id, quantity: 5 }])
    ).rejects.toBeInstanceOf(CheckoutError)

    const fresh = await db.product.findUniqueOrThrow({ where: { id: product.id } })
    expect(fresh.stock).toBe(2) // unchanged
    const orders = await db.order.count({ where: { consumerId } })
    expect(orders).toBe(0) // no orphan order
  })

  it('allows unlimited stock (services)', async () => {
    const { product } = await seedTenantWithProduct(null)
    const ids = await createOrdersForCart(db, consumerId, [{ id: product.id, quantity: 99 }])
    expect(ids).toHaveLength(1)
  })

  it('splits a multi-tenant cart into one order per tenant', async () => {
    const a = await seedTenantWithProduct(10)
    const b = await seedTenantWithProduct(10)
    const ids = await createOrdersForCart(db, consumerId, [
      { id: a.product.id, quantity: 1 },
      { id: b.product.id, quantity: 1 },
    ])
    expect(ids).toHaveLength(2)
  })

  it('rejects invalid quantities', async () => {
    const { product } = await seedTenantWithProduct(10)
    await expect(
      createOrdersForCart(db, consumerId, [{ id: product.id, quantity: 0 }])
    ).rejects.toBeInstanceOf(CheckoutError)
    await expect(
      createOrdersForCart(db, consumerId, [{ id: product.id, quantity: -2 }])
    ).rejects.toBeInstanceOf(CheckoutError)
  })
})
