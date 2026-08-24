'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireTenantMember, getCurrentMembership } from '@/lib/dal'
import { publish } from '@/lib/events'

const schema = z.object({
  orderId: z.string().min(1),
  status: z.nativeEnum(OrderStatus),
})

// A pyme advances one of its own orders through the fulfilment states.
export async function updateOrderStatus(orderId: string, status: string) {
  const parsed = schema.safeParse({ orderId, status })
  if (!parsed.success) throw new Error('Estado inválido')

  const membership = await getCurrentMembership()
  if (!membership) throw new Error('No autorizado')

  // Ensure the order belongs to a tenant this user manages.
  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } })
  if (!order) throw new Error('Pedido no encontrado')
  await requireTenantMember(order.tenantId, ['OWNER', 'STAFF'])

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: parsed.data.status },
  })

  publish({
    type: 'order.status_changed',
    tenantId: updated.tenantId,
    consumerId: updated.consumerId,
    orderId: updated.id,
    status: updated.status,
  })

  revalidatePath('/dashboard/orders')
}
