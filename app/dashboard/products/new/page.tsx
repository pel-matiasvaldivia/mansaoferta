import ProductForm from '@/components/ProductForm'
import { createProduct } from '../actions'

export default function NewProductPage() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Nuevo producto o servicio</h1>
      <ProductForm action={createProduct} submitLabel="Publicar" />
    </section>
  )
}
