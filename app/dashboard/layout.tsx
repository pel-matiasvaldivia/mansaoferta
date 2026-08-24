import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentMembership, requireUser } from '@/lib/dal'

// The dashboard is the pyme (tenant) workspace. Consumers without a membership
// are redirected to their purchases page.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()
  const membership = await getCurrentMembership()
  if (!membership) redirect('/orders')

  const tabs = [
    { href: '/dashboard/products', label: 'Productos' },
    { href: '/dashboard/orders', label: 'Pedidos' },
    { href: '/dashboard/analytics', label: 'Analíticas' },
    { href: '/dashboard/settings', label: 'Configuración' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-xs text-gray-400">Negocio</p>
              <p className="font-semibold">{membership.tenant.name}</p>
            </div>
            <Link
              href={`/s/${membership.tenant.slug}`}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Ver vidriera pública
            </Link>
          </div>
          <nav className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="whitespace-nowrap border-b-2 border-transparent py-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400"
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  )
}
