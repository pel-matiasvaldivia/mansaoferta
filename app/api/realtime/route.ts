import { auth } from '@/auth'
import { getCurrentMembership } from '@/lib/dal'
import { subscribe, type RealtimeEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

// Server-Sent Events stream. Replaces Supabase Realtime: pymes receive
// order.created for their tenant; consumers receive order.status_changed for
// their own orders. Authorization is decided here (server-side), so a client
// can never subscribe to another tenant's events.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }
  const userId = session.user.id
  const membership = await getCurrentMembership()
  const tenantId = membership?.tenantId ?? null

  const encoder = new TextEncoder()
  let unsubscribe = () => {}
  let heartbeat: ReturnType<typeof setInterval>

  const relevant = (event: RealtimeEvent) => {
    if (event.type === 'order.created') return event.tenantId === tenantId
    if (event.type === 'order.status_changed') return event.consumerId === userId
    return false
  }

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      send({ type: 'connected' })

      unsubscribe = subscribe((event) => {
        if (relevant(event)) send(event)
      })

      // Heartbeat keeps proxies from closing the idle connection.
      heartbeat = setInterval(
        () => controller.enqueue(encoder.encode(': ping\n\n')),
        25000
      )
    },
    cancel() {
      clearInterval(heartbeat)
      unsubscribe()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
