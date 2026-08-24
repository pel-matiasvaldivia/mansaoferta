import { prisma } from '@/lib/db'
import { getCurrentMembership } from '@/lib/dal'
import PymeOrderList, { type PymeOrder } from '@/components/PymeOrderList'

export default async function OrdersPage() {
  const membership = await getCurrentMembership()
  if (!membership) return null

  const orders = await prisma.order.findMany({
    where: { tenantId: membership.tenantId },
    include: {
      consumer: { select: { name: true, email: true } },
      items: { select: { titleSnapshot: true, quantity: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const data: PymeOrder[] = orders.map((o) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
    consumerName: o.consumer.name,
    consumerEmail: o.consumer.email,
    items: o.items.map((it) => ({ title: it.titleSnapshot, quantity: it.quantity })),
  }))

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Pedidos recibidos</h1>
      <PymeOrderList initialOrders={data} />
    </section>
  )
}
