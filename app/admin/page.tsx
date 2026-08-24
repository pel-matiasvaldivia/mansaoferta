import { prisma } from '@/lib/db'
import { requireSuperadmin } from '@/lib/dal'
import { planConfig } from '@/lib/plans'

// SaaS operator view. Protected by requireSuperadmin (globalRole === SUPERADMIN).
export default async function AdminPage() {
  await requireSuperadmin()

  const tenants = await prisma.tenant.findMany({
    include: {
      _count: { select: { products: true, orders: true, memberships: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Panel de operador</h1>
      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {['Negocio', 'Plan', 'Productos', 'Pedidos', 'Miembros', 'Alta'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tenants.map((t) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3">{planConfig(t.plan).label}</td>
                <td className="px-4 py-3">{t._count.products}</td>
                <td className="px-4 py-3">{t._count.orders}</td>
                <td className="px-4 py-3">{t._count.memberships}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
