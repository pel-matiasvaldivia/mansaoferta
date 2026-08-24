'use client'

import { useCart } from "@/context/CartContext"
import { Check, ShoppingCart } from "lucide-react"
import { useState } from "react"

export type ComboData = {
    id: string
    title: string
    description: string
    price: number
    stock: number
    image_url: string | null
    pyme_id: string
}

export default function ComboCard({ combo }: { combo: ComboData }) {
    const { addItem } = useCart()
    const [added, setAdded] = useState(false)

    const handleAdd = () => {
        addItem(combo)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    return (
        <div className="rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="relative h-48 w-full bg-gray-200">
                {combo.image_url ? (
                    <img src={combo.image_url} alt={combo.title} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">Sin Imagen</div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-1">{combo.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4 flex-grow">{combo.description}</p>
                <div className="mt-auto flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-2 rounded">
                    <span className="text-xl font-bold text-indigo-600">${combo.price}</span>
                    <button
                        onClick={handleAdd}
                        disabled={combo.stock < 1}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors
                            ${added
                                ? 'bg-green-600 text-white'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300'}
                        `}
                    >
                        {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                        {added ? 'Agregado' : 'Comprar'}
                    </button>
                </div>
            </div>
        </div>
    )
}
