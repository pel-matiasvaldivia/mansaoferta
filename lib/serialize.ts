import type { Product, Tenant } from '@prisma/client'
import type { ProductCardData } from '@/components/ProductCard'

// Prisma Decimal / Date values are not serializable across the server→client
// boundary, so map DB rows to plain objects for client components.
export function toProductCard(
  product: Product,
  tenant: Pick<Tenant, 'id' | 'name'>
): ProductCardData {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    tenantId: tenant.id,
    tenantName: tenant.name,
    imageUrl: product.imageUrl,
    type: product.type,
  }
}
