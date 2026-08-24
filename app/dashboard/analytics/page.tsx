import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getCurrentMembership } from '@/lib/dal'

export default async function AnalyticsPage() {
  const membership = await getCurrentMembership()
  if (!membership) return null

  // Load this tenant's orders with their line items so units reflect real
  // quantities (the old schema had no quantity and miscounted this).
  const orders = await prisma.order.findMany({
    where: { tenantId: membership.tenantId, status: { not: 'CANCELLED' } },
    include: { items: true },
  })

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const stats = new Map<string, { title: string; units: number; revenue: number }>()
  for (const order of orders) {
    for (const item of order.items) {
      const entry = stats.get(item.productId) ?? {
        title: item.titleSnapshot,
        units: 0,
        revenue: 0,
      }
      entry.units += item.quantity
      entry.revenue += Number(item.lineTotal)
      stats.set(item.productId, entry)
    }
  }
  const rankings = [...stats.entries()]
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.revenue - a.revenue)

  const cards = [
    {
      label: 'Ingresos Totales',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      iconWrap: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Pedidos',
      value: String(totalOrders),
      icon: ShoppingCart,
      iconWrap: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Valor Promedio',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      iconWrap: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Analíticas de ventas</h1>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{c.label}</p>
                <p className="mt-2 text-3xl font-bold">{c.value}</p>
              </div>
              <div className={`rounded-full p-3 ${c.iconWrap}`}>
                <c.icon className={`h-8 w-8 ${c.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="flex items-center border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <Package className="mr-2 h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold">Ranking de productos</h2>
        </div>
        {rankings.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">Todavía no hay ventas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {['#', 'Producto', 'Unidades', 'Ingresos', '% del total'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rankings.map((r, i) => {
                  const pct = totalRevenue > 0 ? ((r.revenue / totalRevenue) * 100).toFixed(1) : '0.0'
                  return (
                    <tr key={r.id}>
                      <td className="px-6 py-4">
                        {['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`}
                      </td>
                      <td className="px-6 py-4 font-medium">{r.title}</td>
                      <td className="px-6 py-4">{r.units}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">${r.revenue.toFixed(2)}</td>
                      <td className="px-6 py-4">{pct}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
