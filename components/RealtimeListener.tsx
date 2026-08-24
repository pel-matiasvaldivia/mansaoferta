'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Connects to the /api/realtime SSE stream and turns order events into toasts.
// The server decides which events this user is allowed to receive.
export default function RealtimeListener() {
  const router = useRouter()

  useEffect(() => {
    const source = new EventSource('/api/realtime')

    source.onmessage = (message) => {
      let event: { type: string; total?: string; status?: string }
      try {
        event = JSON.parse(message.data)
      } catch {
        return
      }

      if (event.type === 'order.created') {
        toast.success('¡Nuevo pedido recibido!', {
          description: event.total ? `Total: $${event.total}` : undefined,
          action: { label: 'Ver', onClick: () => router.push('/dashboard/orders') },
        })
        router.refresh()
      } else if (event.type === 'order.status_changed') {
        const label = statusLabel(event.status)
        toast.info(`Actualización de pedido: ${label}`, {
          action: { label: 'Ver', onClick: () => router.push('/dashboard') },
        })
        router.refresh()
      }
    }

    // Let the browser auto-reconnect; only log unexpected errors.
    source.onerror = () => {}

    return () => source.close()
  }, [router])

  return null
}

function statusLabel(status?: string) {
  switch (status) {
    case 'PREPARING':
      return 'En preparación'
    case 'READY':
      return 'Listo para retirar'
    case 'DELIVERED':
      return 'Entregado'
    case 'CANCELLED':
      return 'Cancelado'
    default:
      return 'Actualizado'
  }
}
