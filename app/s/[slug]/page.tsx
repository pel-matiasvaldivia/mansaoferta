import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProductCard from '@/components/ProductCard'
import { toProductCard } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

// Public storefront for a single pyme (tenant).
export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true, OR: [{ stock: null }, { stock: { gt: 0 } }] },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!tenant) notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center gap-4">
        {tenant.logoUrl && (
          <img src={tenant.logoUrl} alt={tenant.name} className="h-16 w-16 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-3xl font-bold">{tenant.name}</h1>
          {tenant.city && <p className="text-sm text-gray-500">{tenant.city}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tenant.products.map((product) => (
          <ProductCard key={product.id} product={toProductCard(product, tenant)} />
        ))}
      </div>

      {tenant.products.length === 0 && (
        <p className="py-20 text-center text-gray-500">Este negocio aún no publicó ofertas.</p>
      )}
    </div>
  )
}
