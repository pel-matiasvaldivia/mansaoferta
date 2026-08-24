import { EventEmitter } from 'events'

// In-process pub/sub used to push realtime order events to connected SSE
// clients. This works for a single app instance. To scale horizontally, swap
// the emitter for Redis pub/sub or Postgres LISTEN/NOTIFY behind this same API.

export type RealtimeEvent =
  | { type: 'order.created'; tenantId: string; orderId: string; total: string }
  | {
      type: 'order.status_changed'
      tenantId: string
      consumerId: string
      orderId: string
      status: string
    }

const globalForBus = globalThis as unknown as { __bus?: EventEmitter }

const bus = globalForBus.__bus ?? new EventEmitter()
bus.setMaxListeners(0)
globalForBus.__bus = bus

export function publish(event: RealtimeEvent) {
  bus.emit('event', event)
}

export function subscribe(listener: (event: RealtimeEvent) => void) {
  bus.on('event', listener)
  return () => bus.off('event', listener)
}
