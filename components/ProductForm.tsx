'use client'

import { useState } from 'react'

type Initial = {
  id?: string
  type?: 'PRODUCT' | 'SERVICE'
  title?: string
  description?: string | null
  price?: number
  stock?: number | null
}

// Shared create/edit form. `action` is the server action passed by the page.
export default function ProductForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>
  initial?: Initial
  submitLabel: string
}) {
  const [type, setType] = useState<'PRODUCT' | 'SERVICE'>(initial?.type ?? 'PRODUCT')

  return (
    <form action={action} className="max-w-xl space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label className="block text-sm font-medium">Tipo</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(['PRODUCT', 'SERVICE'] as const).map((t) => (
            <label
              key={t}
              className={`cursor-pointer rounded-md border p-2 text-center text-sm font-medium ${
                type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <input type="radio" name="type" value={t} className="sr-only" checked={type === t} onChange={() => setType(t)} />
              {t === 'PRODUCT' ? 'Producto' : 'Servicio'}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="title">Título</label>
        <input id="title" name="title" defaultValue={initial?.title} required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="description">Descripción</label>
        <textarea id="description" name="description" defaultValue={initial?.description ?? ''} rows={3}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="price">Precio (ARS)</label>
          <input id="price" name="price" type="number" min="0" step="0.01" defaultValue={initial?.price}
            required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="stock">
            Stock {type === 'SERVICE' && <span className="text-gray-400">(vacío = ilimitado)</span>}
          </label>
          <input id="stock" name="stock" type="number" min="0" step="1"
            defaultValue={initial?.stock ?? ''}
            placeholder={type === 'SERVICE' ? 'Ilimitado' : '0'}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="image">Imagen</label>
        <input id="image" name="image" type="file" accept="image/*"
          className="mt-1 w-full text-sm" />
      </div>

      <button type="submit" className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700">
        {submitLabel}
      </button>
    </form>
  )
}
