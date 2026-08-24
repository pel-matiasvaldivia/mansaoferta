'use client'

import { useCart } from "@/context/CartContext"
import { placeOrder } from "./actions"
import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CartPage() {
    const { items, removeItem, total, clearCart } = useCart()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleCheckout = async () => {
        setLoading(true)
        setError(null)
        try {
            const result = await placeOrder(items.map(i => ({ id: i.id, quantity: i.quantity })))
            if (result?.error) {
                setError(result.error)
            } else {
                clearCart()
                router.push('/dashboard')
            }
        } catch (e) {
            setError('Ocurrió un error inesperado')
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
                <Link href="/browse" className="text-indigo-600 hover:underline">
                    Ir a explorar ofertas
                </Link>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                {item.image_url ? (
                                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover object-center" />
                                ) : (
                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin img</div>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col">
                                <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                        <h3>{item.title}</h3>
                                        <p className="ml-4">${item.price * item.quantity}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">Cant: {item.quantity}</p>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-1">
                    <div className="rounded-lg border bg-gray-50 dark:bg-gray-900 px-4 py-6 sm:p-6 lg:p-8">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resumen</h2>
                        <div className="mt-6 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Total</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">${total}</span>
                        </div>

                        {error && (
                            <div className="mt-4 p-2 text-sm text-red-600 bg-red-100 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="mt-6 w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Pedido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
