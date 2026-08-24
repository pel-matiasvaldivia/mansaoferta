'use client'

import { useCart, type CartProduct } from '@/context/CartContext'
import { Check, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export type ProductCardData = CartProduct & {
    slug: string
    stock: number | null // null = unlimited (services)
}

export default function ProductCard({ product }: { product: ProductCardData }) {
    const { addItem } = useCart()
    const [added, setAdded] = useState(false)

    const soldOut = product.stock !== null && product.stock < 1

    const handleAdd = () => {
        addItem(product)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <div className="rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden flex flex-col">
            <Link href={`/p/${product.slug}`} className="relative h-48 w-full bg-gray-200 block">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">Sin Imagen</div>
                )}
                <span className="absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                    {product.type === 'SERVICE' ? 'Servicio' : 'Producto'}
                </span>
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-xs text-gray-400">{product.tenantName}</p>
                <Link href={`/p/${product.slug}`}>
                    <h3 className="font-bold text-lg mb-1 hover:text-indigo-600">{product.title}</h3>
                </Link>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4 flex-grow">{product.description}</p>
                <div className="mt-auto flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    <span className="text-xl font-bold text-indigo-600">${product.price}</span>
                    <button
                        onClick={handleAdd}
                        disabled={soldOut}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            added
                                ? 'bg-green-600 text-white'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300'
                        }`}
                    >
                        {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                        {soldOut ? 'Sin stock' : added ? 'Agregado' : 'Agregar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
