'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/dal'
import { publish } from '@/lib/events'
import { createOrdersForCart, CheckoutError } from '@/lib/checkout'

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive().max(999),
      })
    )
    .min(1, 'El carrito está vacío.'),
})

export type CheckoutResult = { error?: string; success?: boolean; orderIds?: string[] }

// Places orders for the current user. A cart can span multiple pymes, so it is
// split into one Order per tenant. Prices come from the DB (never the client)
// and stock is decremented atomically — see lib/checkout.
export async function placeOrder(rawItems: unknown): Promise<CheckoutResult> {
  const user = await requireUser()

  const parsed = checkoutSchema.safeParse({ items: rawItems })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    const orderIds = await createOrdersForCart(prisma, user.id, parsed.data.items)

    // Notify pymes (outside the transaction).
    const created = await prisma.order.findMany({ where: { id: { in: orderIds } } })
    for (const order of created) {
      publish({
        type: 'order.created',
        tenantId: order.tenantId,
        orderId: order.id,
        total: order.total.toFixed(2),
      })
    }

    return { success: true, orderIds }
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { error: error.message }
    }
    console.error('Checkout error:', error)
    return { error: 'No pudimos procesar tu compra. Intentá de nuevo.' }
  }
}
