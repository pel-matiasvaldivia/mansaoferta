import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCurrentMembership } from '@/lib/dal'
import ProductForm from '@/components/ProductForm'
import { updateProduct } from '../actions'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const membership = await getCurrentMembership()
  if (!membership) return null

  const product = await prisma.product.findFirst({
    where: { id, tenantId: membership.tenantId },
  })
  if (!product) notFound()

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Editar</h1>
      <ProductForm
        action={updateProduct}
        submitLabel="Guardar cambios"
        initial={{
          id: product.id,
          type: product.type,
          title: product.title,
          description: product.description,
          price: Number(product.price),
          stock: product.stock,
        }}
      />
    </section>
  )
}
