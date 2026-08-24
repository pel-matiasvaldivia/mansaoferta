'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { requireTenantMember, getCurrentMembership } from '@/lib/dal'
import { uploadImage } from '@/lib/storage'
import { uniqueSlug } from '@/lib/slug'
import { planConfig } from '@/lib/plans'

const productSchema = z.object({
  type: z.enum(['PRODUCT', 'SERVICE']),
  title: z.string().min(2, 'El título es obligatorio'),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative('El precio no puede ser negativo'),
  // Empty stock = unlimited (services).
  stock: z
    .union([z.literal(''), z.coerce.number().int().nonnegative()])
    .transform((v) => (v === '' ? null : v)),
})

async function currentTenantId() {
  const membership = await getCurrentMembership()
  if (!membership) redirect('/dashboard')
  return membership.tenantId
}

export async function createProduct(formData: FormData) {
  const tenantId = await currentTenantId()
  await requireTenantMember(tenantId, ['OWNER', 'STAFF'])

  const parsed = productSchema.safeParse({
    type: formData.get('type'),
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    stock: formData.get('stock'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  // Enforce the tenant's plan limit.
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } })
  const count = await prisma.product.count({ where: { tenantId } })
  if (count >= planConfig(tenant.plan).maxProducts) {
    throw new Error(
      `Alcanzaste el límite de tu plan (${planConfig(tenant.plan).maxProducts}). Actualizá a Pro para publicar más.`
    )
  }

  const imageUrl = await maybeUpload(formData.get('image'), tenantId)

  await prisma.product.create({
    data: {
      tenantId,
      type: parsed.data.type,
      title: parsed.data.title,
      slug: uniqueSlug(parsed.data.title),
      description: parsed.data.description || null,
      price: parsed.data.price,
      stock: parsed.data.stock,
      imageUrl,
    },
  })

  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}

export async function updateProduct(formData: FormData) {
  const tenantId = await currentTenantId()
  await requireTenantMember(tenantId, ['OWNER', 'STAFF'])

  const id = String(formData.get('id'))
  const parsed = productSchema.safeParse({
    type: formData.get('type'),
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    stock: formData.get('stock'),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  const imageUrl = await maybeUpload(formData.get('image'), tenantId)

  // Scope by tenantId so a member can never edit another tenant's product.
  await prisma.product.updateMany({
    where: { id, tenantId },
    data: {
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description || null,
      price: parsed.data.price,
      stock: parsed.data.stock,
      ...(imageUrl ? { imageUrl } : {}),
    },
  })

  revalidatePath('/dashboard/products')
  redirect('/dashboard/products')
}

export async function deleteProduct(formData: FormData) {
  const tenantId = await currentTenantId()
  await requireTenantMember(tenantId, ['OWNER', 'STAFF'])
  const id = String(formData.get('id'))
  await prisma.product.deleteMany({ where: { id, tenantId } })
  revalidatePath('/dashboard/products')
}

export async function toggleProductActive(formData: FormData) {
  const tenantId = await currentTenantId()
  await requireTenantMember(tenantId, ['OWNER', 'STAFF'])
  const id = String(formData.get('id'))
  const product = await prisma.product.findFirst({ where: { id, tenantId } })
  if (!product) return
  await prisma.product.update({ where: { id }, data: { active: !product.active } })
  revalidatePath('/dashboard/products')
}

async function maybeUpload(value: FormDataEntryValue | null, tenantId: string) {
  if (value instanceof File && value.size > 0) {
    const { url } = await uploadImage(value, `products/${tenantId}`)
    return url
  }
  return null
}
