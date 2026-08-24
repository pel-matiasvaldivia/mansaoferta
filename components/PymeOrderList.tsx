'use client'

import { updateOrderStatus } from '@/app/dashboard/actions'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export type PymeOrder = {
  id: string
  status: string
  total: number
  createdAt: string
  consumerName: string | null
  consumerEmail: string
  items: { title: string; quantity: number }[]
}

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Recibido',
  PREPARING: 'En preparación',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const NEXT: Record<string, { status: string; label: string } | null> = {
  RECEIVED: { status: 'PREPARING', label: 'Marcar en preparación' },
  PREPARING: { status: 'READY', label: 'Marcar listo' },
  READY: { status: 'DELIVERED', label: 'Marcar entregado' },
  DELIVERED: null,
  CANCELLED: null,
}

export default function PymeOrderList({ initialOrders }: { initialOrders: PymeOrder[] }) {
  return (
    <div className="space-y-4">
      {initialOrders.length === 0 && <p className="text-gray-500">No hay pedidos todavía.</p>}
      {initialOrders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  )
}

function OrderRow({ order }: { order: PymeOrder }) {
  const [loading, setLoading] = useState(false)
  const next = NEXT[order.status]

  const advance = async () => {
    if (!next) return
    setLoading(true)
    try {
      await updateOrderStatus(order.id, next.status)
    } catch {
      alert('No se pudo actualizar el estado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:flex-row md:items-center">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-bold">Pedido #{order.id.slice(0, 8)}</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold dark:bg-gray-700">
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <p className="text-sm text-gray-500">Cliente: {order.consumerName || order.consumerEmail}</p>
        <ul className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {order.items.map((it, i) => (
            <li key={i}>
              {it.quantity}× {it.title}
            </li>
          ))}
        </ul>
        <p className="mt-1 font-medium">Total: ${order.total}</p>
      </div>

      {next && (
        <button
          onClick={advance}
          disabled={loading}
          className="flex items-center rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          {next.label}
        </button>
      )}
    </div>
  )
}
