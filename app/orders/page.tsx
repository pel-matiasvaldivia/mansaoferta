import Link from 'next/link'
import { prisma } from '@/lib/db'
import { requireUser } from '@/lib/dal'

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Recibido',
  PREPARING: 'En preparación',
  READY: 'Listo para retirar',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export const dynamic = 'force-dynamic'

export default async function MyOrdersPage() {
  const user = await requireUser()

  const orders = await prisma.order.findMany({
    where: { consumerId: user.id },
    include: {
      tenant: { select: { name: true, slug: true } },
      items: { select: { titleSnapshot: true, quantity: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Mis compras</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-gray-500">No tenés pedidos todavía.</p>
          <Link href="/browse" className="mt-4 inline-block rounded bg-indigo-600 px-4 py-2 text-white">
            Explorar ofertas
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <Link href={`/s/${order.tenant.slug}`} className="font-bold hover:text-indigo-600">
                  {order.tenant.name}
                </Link>
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {order.items.map((it, i) => (
                  <li key={i}>{it.quantity}× {it.titleSnapshot}</li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold">Total: ${Number(order.total)}</span>
                <span className="text-sm text-gray-400">{order.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
