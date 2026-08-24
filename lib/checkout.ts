import { Prisma, type PrismaClient } from '@prisma/client'

export class CheckoutError extends Error {}

export type CheckoutLine = { id: string; quantity: number }

// Core checkout logic, decoupled from auth/Next so it can be unit-tested.
// Splits a cart into one order per tenant and decrements stock atomically
// inside a single transaction. Prices always come from the DB.
export async function createOrdersForCart(
  db: PrismaClient,
  consumerId: string,
  lines: CheckoutLine[]
): Promise<string[]> {
  const quantities = new Map<string, number>()
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new CheckoutError('Cantidad inválida.')
    }
    quantities.set(line.id, (quantities.get(line.id) ?? 0) + line.quantity)
  }
  const ids = [...quantities.keys()]
  if (ids.length === 0) throw new CheckoutError('El carrito está vacío.')

  return db.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: ids }, active: true },
    })
    if (products.length !== ids.length) {
      throw new CheckoutError('Algunos productos ya no están disponibles.')
    }

    const byTenant = new Map<string, typeof products>()
    for (const p of products) {
      const list = byTenant.get(p.tenantId) ?? []
      list.push(p)
      byTenant.set(p.tenantId, list)
    }

    const createdIds: string[] = []

    for (const [tenantId, tenantProducts] of byTenant) {
      let subtotal = new Prisma.Decimal(0)
      const itemsData = tenantProducts.map((p) => {
        const qty = quantities.get(p.id)!
        const lineTotal = p.price.mul(qty)
        subtotal = subtotal.add(lineTotal)
        return {
          productId: p.id,
          titleSnapshot: p.title,
          unitPrice: p.price,
          quantity: qty,
          lineTotal,
        }
      })

      for (const p of tenantProducts) {
        if (p.stock === null) continue // unlimited (services)
        const qty = quantities.get(p.id)!
        const updated = await tx.product.updateMany({
          where: { id: p.id, stock: { gte: qty } },
          data: { stock: { decrement: qty } },
        })
        if (updated.count === 0) {
          throw new CheckoutError(`Stock insuficiente para: ${p.title}`)
        }
      }

      const order = await tx.order.create({
        data: {
          tenantId,
          consumerId,
          subtotal,
          total: subtotal,
          currency: tenantProducts[0].currency,
          items: { create: itemsData },
        },
      })
      createdIds.push(order.id)
    }

    return createdIds
  })
}
