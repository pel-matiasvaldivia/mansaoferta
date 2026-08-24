import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getCurrentMembership } from '@/lib/dal'
import { planConfig } from '@/lib/plans'
import { deleteProduct, toggleProductActive } from './actions'

export default async function ProductsPage() {
  const membership = await getCurrentMembership()
  if (!membership) return null
  const tenant = membership.tenant

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: 'desc' },
  })

  const limit = planConfig(tenant.plan).maxProducts
  const atLimit = products.length >= limit

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos y servicios</h1>
          <p className="text-sm text-gray-500">
            {products.length}
            {Number.isFinite(limit) ? ` / ${limit}` : ''} publicados · Plan {planConfig(tenant.plan).label}
          </p>
        </div>
        {atLimit ? (
          <span className="rounded bg-amber-100 px-3 py-2 text-sm text-amber-800">
            Límite del plan alcanzado
          </span>
        ) : (
          <Link href="/dashboard/products/new" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
            + Nuevo
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed py-10 text-center text-gray-500">
            <p>No publicaste nada aún.</p>
            <p>¡Creá tu primer producto o servicio!</p>
          </div>
        )}

        {products.map((product) => (
          <div
            key={product.id}
            className={`overflow-hidden rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 ${
              !product.active ? 'opacity-60' : ''
            }`}
          >
            {product.imageUrl && (
              <img src={product.imageUrl} alt={product.title} className="h-40 w-full object-cover" />
            )}
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <h3 className="text-lg font-bold">{product.title}</h3>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {product.type === 'SERVICE' ? 'Servicio' : 'Producto'}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-indigo-600">${Number(product.price)}</span>
                <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  {product.stock === null ? 'Sin límite' : `Stock: ${product.stock}`}
                </span>
              </div>
              <div className="mt-4 flex gap-2 border-t pt-4">
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="flex-1 rounded py-2 text-center text-sm font-medium text-indigo-600 hover:bg-gray-50"
                >
                  Editar
                </Link>
                <form action={toggleProductActive} className="flex-1">
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    className={`w-full rounded py-2 text-sm font-medium ${
                      product.active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {product.active ? 'Pausar' : 'Activar'}
                  </button>
                </form>
                <form action={deleteProduct} className="flex-1">
                  <input type="hidden" name="id" value={product.id} />
                  <button className="w-full rounded py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
