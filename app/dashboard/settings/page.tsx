import { getCurrentMembership } from '@/lib/dal'
import { planConfig, PLANS } from '@/lib/plans'
import SettingsForm from './SettingsForm'

export default async function SettingsPage() {
  const membership = await getCurrentMembership()
  if (!membership) return null
  const tenant = membership.tenant
  const plan = planConfig(tenant.plan)

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <h1 className="mb-6 text-2xl font-bold">Datos del negocio</h1>
        <SettingsForm
          initial={{
            name: tenant.name,
            address: tenant.address ?? '',
            city: tenant.city ?? '',
            phone: tenant.phone ?? '',
            hasMpToken: !!tenant.mpAccessToken,
            logoUrl: tenant.logoUrl,
          }}
        />
      </section>

      <aside>
        <h2 className="mb-4 text-lg font-bold">Tu plan</h2>
        <div className="rounded-lg border p-4 dark:border-gray-700">
          <p className="text-2xl font-bold">{plan.label}</p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600 dark:text-gray-300">
            {plan.features.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
          {tenant.plan === 'FREE' && (
            <div className="mt-4 rounded bg-indigo-50 p-3 text-sm dark:bg-indigo-950">
              <p className="font-medium text-indigo-700 dark:text-indigo-300">
                Pasá a {PLANS.PRO.label}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Productos ilimitados y analíticas. (Cobro próximamente.)
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
