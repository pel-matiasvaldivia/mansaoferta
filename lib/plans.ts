import type { PlanTier } from '@prisma/client'

// SaaS plan definitions. Limits are enforced in code (see lib/dal). Billing is
// not wired yet — the Subscription model + this config are the hook for later.

export type PlanConfig = {
  tier: PlanTier
  label: string
  priceMonthly: number // ARS, informational for now
  maxProducts: number // Infinity for unlimited
  features: string[]
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  FREE: {
    tier: 'FREE',
    label: 'Gratis',
    priceMonthly: 0,
    maxProducts: 10,
    features: ['Hasta 10 productos o servicios', 'Dashboard de pedidos', 'Notificaciones en vivo'],
  },
  PRO: {
    tier: 'PRO',
    label: 'Pro',
    priceMonthly: 9999,
    maxProducts: Infinity,
    features: ['Productos y servicios ilimitados', 'Analíticas avanzadas', 'Soporte prioritario'],
  },
}

export function planConfig(tier: PlanTier): PlanConfig {
  return PLANS[tier]
}
