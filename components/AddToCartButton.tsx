'use client'

import { useCart, type CartProduct } from '@/context/CartContext'
import { Check, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

export default function AddToCartButton({
  product,
  soldOut,
}: {
  product: CartProduct
  soldOut: boolean
}) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  return (
    <button
      onClick={() => {
        addItem(product)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
      }}
      disabled={soldOut}
      className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 font-medium text-white transition-colors ${
        added ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300'
      }`}
    >
      {added ? <Check size={18} /> : <ShoppingCart size={18} />}
      {soldOut ? 'Sin stock' : added ? 'Agregado al carrito' : 'Agregar al carrito'}
    </button>
  )
}
