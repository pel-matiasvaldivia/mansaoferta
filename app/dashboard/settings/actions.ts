'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentMembership, requireTenantMember } from '@/lib/dal'
import { uploadImage } from '@/lib/storage'
import { encryptSecret } from '@/lib/crypto'

const schema = z.object({
  name: z.string().min(2, 'El nombre del negocio es obligatorio'),
  address: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  mpToken: z.string().optional(),
})

export type SettingsState = { error?: string; ok?: boolean } | undefined

export async function updateTenantProfile(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const membership = await getCurrentMembership()
  if (!membership) return { error: 'No autorizado' }
  await requireTenantMember(membership.tenantId, ['OWNER'])

  const parsed = schema.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    city: formData.get('city'),
    phone: formData.get('phone'),
    mpToken: formData.get('mpToken'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const logo = formData.get('logo')
  let logoUrl: string | undefined
  if (logo instanceof File && logo.size > 0) {
    try {
      logoUrl = (await uploadImage(logo, `logos/${membership.tenantId}`)).url
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Error al subir el logo' }
    }
  }

  // The MercadoPago token is encrypted at rest and never exposed to clients.
  const mpToken = parsed.data.mpToken?.trim()

  await prisma.tenant.update({
    where: { id: membership.tenantId },
    data: {
      name: parsed.data.name,
      address: parsed.data.address || null,
      city: parsed.data.city || null,
      phone: parsed.data.phone || null,
      ...(logoUrl ? { logoUrl } : {}),
      ...(mpToken ? { mpAccessToken: encryptSecret(mpToken) } : {}),
    },
  })

  revalidatePath('/dashboard/settings')
  return { ok: true }
}
