import { createClient } from '@/utils/supabase/server'
import ComboCard from '@/components/ComboCard'

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
    const supabase = await createClient()

    // Fetch only active combos with stock
    const { data: combos } = await supabase
        .from('combos')
        .select('*')
        .eq('active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explorar Ofertas</h1>
                    <p className="mt-2 text-sm text-gray-500">Encuentra las mejores promociones en tu zona.</p>
                </div>
                {/* Future: Search Bar */}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {combos?.map((combo) => (
                    <ComboCard key={combo.id} combo={combo} />
                ))}
            </div>

            {(!combos || combos.length === 0) && (
                <div className="text-center py-20">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No hay ofertas disponibles.</h3>
                    <p className="text-gray-500">Vuelve más tarde o revisa otras categorías.</p>
                </div>
            )}
        </div>
    )
}
