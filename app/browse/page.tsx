import { prisma } from '@/lib/db'
import ProductCard from '@/components/ProductCard'
import { toProductCard } from '@/lib/serialize'

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
  // Public marketplace across all tenants: active products, in stock (or
  // services with unlimited stock).
  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [{ stock: null }, { stock: { gt: 0 } }],
    },
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 60,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explorar Ofertas</h1>
          <p className="mt-2 text-sm text-gray-500">Productos y servicios de pymes en tu zona.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={toProductCard(product, product.tenant)} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay ofertas disponibles.</h3>
          <p className="text-gray-500">Vuelve más tarde.</p>
        </div>
      )}
    </div>
  )
}
