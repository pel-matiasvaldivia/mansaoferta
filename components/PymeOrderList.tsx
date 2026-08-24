'use client'

import { updateOrderStatus } from "@/app/dashboard/actions"
import { useState } from "react"
import { Loader2 } from "lucide-react"

type Order = {
    id: string
    status: string
    total: number
    created_at: string
    combos: {
        title: string
        image_url: string | null
    }
    profiles: {
        name: string
        email: string
    }
}

export default function PymeOrderList({ initialOrders }: { initialOrders: any[] }) {
    // We could use optimistic updates here, but for now simple re-render via revalidatePath (server) is enough.
    // Actually, passing initialOrders is for Server Side Rendering.
    // We will iterate and show buttons.

    return (
        <div className="space-y-4">
            {initialOrders.length === 0 && (
                <p className="text-gray-500">No hay pedidos pendientes.</p>
            )}
            {initialOrders.map(order => (
                <OrderRow key={order.id} order={order} />
            ))}
        </div>
    )
}

function OrderRow({ order }: { order: Order }) {
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        setLoading(true)
        try {
            await updateOrderStatus(order.id, newStatus)
        } catch (e) {
            alert('Error updating status')
        } finally {
            setLoading(false)
        }
    }

    const nextStatus =
        order.status === 'received' ? 'preparing' :
            order.status === 'preparing' ? 'ready' :
                order.status === 'ready' ? 'delivered' : null

    const nextStatusLabel =
        order.status === 'received' ? 'Marcar En Preparación' :
            order.status === 'preparing' ? 'Marcar Listo' :
                order.status === 'ready' ? 'Marcar Entregado' : null

    return (
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    {order.combos?.image_url ? (
                        <img src={order.combos.image_url} alt={order.combos.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin img</div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold">{order.combos?.title}</h3>
                    <p className="text-sm text-gray-500">Cliente: {order.profiles?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium">Total: ${order.total}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {nextStatus && (
                    <button
                        onClick={() => handleStatusChange(nextStatus)}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                    >
                        {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        {nextStatusLabel}
                    </button>
                )}
            </div>
        </div>
    )
}
