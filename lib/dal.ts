import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { MembershipRole } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

// Data Access Layer: the single place that enforces authentication and tenant
// authorization. Every sensitive query/mutation must go through these helpers.
// This replaces Supabase Row Level Security with explicit server-side checks.

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user
})

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireSuperadmin() {
  const user = await requireUser()
  if (user.globalRole !== 'SUPERADMIN') redirect('/')
  return user
}

// Returns the tenant the current user owns/works in, or null if they are a
// plain consumer. A user may belong to several tenants; we use the first.
export const getCurrentMembership = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  return prisma.membership.findFirst({
    where: { userId: user.id },
    include: { tenant: true },
    orderBy: { createdAt: 'asc' },
  })
})

// Ensures the current user is a member of `tenantId` (optionally with one of
// `roles`). Throws on failure — callers should treat it as a hard authz error.
export async function requireTenantMember(
  tenantId: string,
  roles?: MembershipRole[]
) {
  const user = await requireUser()
  const membership = await prisma.membership.findUnique({
    where: { userId_tenantId: { userId: user.id, tenantId } },
  })
  if (!membership) throw new Error('No autorizado para este negocio.')
  if (roles && !roles.includes(membership.role)) {
    throw new Error('No tenés permisos para esta acción.')
  }
  return { user, membership }
}
