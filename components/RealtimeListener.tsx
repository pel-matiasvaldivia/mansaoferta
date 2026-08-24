'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function RealtimeListener({ userId, role }: { userId: string, role: string }) {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (!userId) return

        // Channel for this specific user
        const channel = supabase
            .channel(`notifications-${userId}`)

        if (role === 'pyme') {
            // Pyme listens for NEW orders (INSERT)
            // But we need to filter by pyme_id, which is on `combos` table.
            // Supabase Realtime Postgres Changes is limited on JOINS.
            // So we listen to 'orders' table. `orders` has `combo_id`.
            // We can't filter by `pyme_id` directly in the subscription filter unless we denormalize `pyme_id` to `orders`.
            // OR... we listen to ALL orders and filter client side? No, security risk (RLS doesn't apply to realtime unless Row Level Security is enabled on publication, but 'postgres_changes' broadcasts to everyone by default unless trusted/private).
            // Actually, Supabase Realtime honors RLS if you set it up correctly (Walrus).
            // For MVP: We will listen to `orders` where we are relevant.
            // Easier: Add `pyme_id` to `orders` table to make this easier? No, schema change.
            // Let's rely on standard subscription. If strict RLS is on, realtime might not receive anything if not configured in publication.

            // WORKAROUND FOR MVP:
            // Just listen to ALL inserts on 'orders' and check if it belongs to us via select?
            // Or just trust the `INSERT` payload if it contains enough info? It only contains columns.
            // `orders` has `combo_id`. We don't know if that combo is ours without fetching.

            // Let's do: Listen to ALL inserts -> Fetch if it's ours -> Notify.
            // This is chatty but works.

            channel
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'orders'
                    },
                    async (payload: any) => {
                        // Check if this order is for one of my combos
                        const order = payload.new
                        const { data } = await supabase
                            .from('combos')
                            .select('pyme_id, title')
                            .eq('id', order.combo_id)
                            .single()

                        if (data && data.pyme_id === userId) {
                            toast.success(`¡Nuevo pedido para ${data.title}!`, {
                                description: `Total: $${order.total}`,
                                action: {
                                    label: 'Ver',
                                    onClick: () => router.push('/dashboard')
                                }
                            })
                            router.refresh()
                        }
                    }
                )
                .subscribe()
        } else {
            // Consumer listens for UPDATE status
            channel
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'orders',
                        filter: `consumer_id=eq.${userId}`
                    },
                    (payload: any) => {
                        const newStatus = payload.new.status
                        const oldStatus = payload.old.status

                        if (newStatus !== oldStatus) {
                            const statusText =
                                newStatus === 'preparing' ? 'En preparación' :
                                    newStatus === 'ready' ? 'Listo para retirar' :
                                        newStatus === 'delivered' ? 'Entregado' : newStatus

                            toast.info(`Actualización de pedido: ${statusText}`, {
                                action: {
                                    label: 'Ver',
                                    onClick: () => router.push('/dashboard')
                                }
                            })
                            router.refresh()
                        }
                    }
                )
                .subscribe()
        }

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, role, router])

    return null
}
