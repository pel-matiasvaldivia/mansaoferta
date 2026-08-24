'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type OrderItem = {
    id: string
    quantity: number
}

// NOTE: For a real app, we should iterate over items and create multiple orders (one per Pyme)
// For MVP, we will assume simplified logic or create separate orders.
// Actually, let's just create one order per unique Pyme in the cart.
export async function placeOrder(items: OrderItem[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Debes iniciar sesión para comprar.' }
    }

    if (!items || items.length === 0) {
        return { error: 'El carrito está vacío.' }
    }

    // 1. Validate Items (Price/Stock) from DB to avoid client manipulation
    const { data: dbProducts, error: fetchError } = await supabase
        .from('combos')
        .select('*')
        .in('id', items.map(i => i.id))

    if (fetchError || !dbProducts) {
        return { error: 'Error al validar productos.' }
    }

    // Group items by Pyme
    const ordersByPyme: Record<string, { total: number, items: any[] }> = {}

    for (const item of items) {
        const product = dbProducts.find(p => p.id === item.id)
        if (!product) continue
        if (product.stock < item.quantity) {
            return { error: `Stock insuficiente para: ${product.title}` }
        }

        if (!ordersByPyme[product.pyme_id]) {
            ordersByPyme[product.pyme_id] = { total: 0, items: [] }
        }

        // Simulating that an order contains only one combo for the MVP schema?
        // Wait, schema has `orders` table with `combo_id`. 
        // This implies 1 Order = 1 Combo. This is a restriction of the current schema designed in Phase 1.
        // "ORDERS ||--o{ COMBOS : contains" -> Actually 1 order row maps to 1 combo_cid.
        // "ORDERS { consumer_id, combo_id, total, status }"

        // So if I buy 3 different combos, I create 3 different database entries in `orders`.
        // If I buy 2 of same combo... the schema doesn't support "quantity" field on `orders`.
        // It's a "Deal" marketplace. 1 Order = 1 Deal execution.
        // We will create N order rows.
    }

    // Execution
    const orderPromises = []

    for (const item of items) {
        const product = dbProducts.find(p => p.id === item.id)
        if (!product) continue;

        // For each quantity unit, we create an order? Or just one order with total price?
        // Schema says: `orders` has `combo_id`. It lacks `quantity`.
        // Let's assume 1 row per "Line Item" effectively.
        // If user buys 2x Combo A, we should probably create two orders or update schema.
        // Updating Schema is safer for MVP: Add 'quantity' to orders.

        // OR... we just insert it.

        orderPromises.push(
            supabase.from('orders').insert({
                consumer_id: user.id,
                combo_id: item.id,
                total: product.price * item.quantity,
                // We are missing 'quantity' in schema. I will assume quantity=1 for the schema constraints for now.
                // Wait, if I sell 2, the total reflects 2. The Pyme sees "Order for Combo X, Total $200".
                // They will fetch the combo price ($100) and deduce quantity is 2.
                // It's hacky but works for MVP without schema migration right now.
                status: 'received'
            })
        )

        // Decrement Stock atomically to prevent race conditions
        orderPromises.push(
            supabase.rpc('decrement_combo_stock', {
                combo_id: product.id,
                quantity: item.quantity
            })
        )
    }

    await Promise.all(orderPromises)

    revalidatePath('/dashboard')
    // Client will handle redirect or clear cart
    return { success: true }
}
