import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { toProductCard } from '@/lib/serialize'
import AddToCartButton from '@/components/AddToCartButton'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { tenant: { select: { id: true, name: true, slug: true, city: true } } },
  })
  if (!product) notFound()

  const card = toProductCard(product, product.tenant)
  const soldOut = product.stock !== null && product.stock < 1

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl border bg-gray-100 dark:border-gray-800">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Sin imagen</div>
          )}
        </div>

        <div>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {product.type === 'SERVICE' ? 'Servicio' : 'Producto'}
          </span>
          <h1 className="mt-3 text-3xl font-bold">{product.title}</h1>
          <Link href={`/s/${product.tenant.slug}`} className="mt-1 block text-sm text-gray-500 hover:text-indigo-600">
            {product.tenant.name}
            {product.tenant.city ? ` · ${product.tenant.city}` : ''}
          </Link>

          <p className="mt-6 whitespace-pre-line text-gray-600 dark:text-gray-300">
            {product.description || 'Sin descripción.'}
          </p>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-3xl font-bold text-indigo-600">${Number(product.price)}</span>
            {product.stock !== null && (
              <span className="text-sm text-gray-500">{product.stock} disponibles</span>
            )}
          </div>

          <div className="mt-6">
            <AddToCartButton product={card} soldOut={soldOut} />
          </div>
        </div>
      </div>
    </div>
  )
}
