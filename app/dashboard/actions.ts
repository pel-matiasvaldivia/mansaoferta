'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = await createClient()

    // Verify ownership? RLS policies "Pymes can update status of their orders" should handle it.
    // The policy:
    // using ( exists ( select 1 from combos where combos.id = orders.combo_id and combos.pyme_id = auth.uid() ) )

    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

    if (error) {
        console.error('Error updating status:', error)
        throw new Error('Error al actualizar el estado')
    }

    revalidatePath('/dashboard')
}
