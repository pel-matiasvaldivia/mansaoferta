import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PymeOrderList from '@/components/PymeOrderList'
import { deleteCombo, toggleComboActive } from './combos/actions'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch profile to check role and completion status
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, profile_completed')
        .eq('id', user.id)
        .single()

    // Redirect Pyme users to setup if profile not completed
    if (profile?.role === 'pyme' && !profile?.profile_completed) {
        redirect('/dashboard/setup')
    }

    if (profile?.role === 'pyme') {
        const { data: combos } = await supabase
            .from('combos')
            .select('*')
            .eq('pyme_id', user.id)
            .order('created_at', { ascending: false })

        // Fetch orders for this Pyme
        // We need to join via combos
        const { data: orders } = await supabase
            .from('orders')
            .select(`
                *,
                combos!inner(id, title, image_url, pyme_id),
                profiles(name, email)
            `)
            .eq('combos.pyme_id', user.id)
            .order('created_at', { ascending: false })

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Navigation Tabs */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8">
                            <a
                                href="/dashboard"
                                className="border-b-2 border-indigo-600 py-4 px-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                            >
                                Mis Combos
                            </a>
                            <a
                                href="#pedidos"
                                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Pedidos
                            </a>
                            <a
                                href="/dashboard/analytics"
                                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Analíticas
                            </a>
                        </nav>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Mis Combos</h1>
                            <a
                                href="/dashboard/combos/new"
                                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                            >
                                + Nuevo Combo
                            </a>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {combos?.length === 0 && (
                                <div className="col-span-full text-center text-gray-500 py-10 border rounded-lg border-dashed">
                                    <p>No tienes combos publicados aún.</p>
                                    <p>¡Crea el primero para empezar a vender!</p>
                                </div>
                            )}

                            {combos?.map((combo) => (
                                <div key={combo.id} className={`rounded-lg border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden ${!combo.active ? 'opacity-60' : ''}`}>
                                    {combo.image_url && (
                                        <img src={combo.image_url} alt={combo.title} className="h-48 w-full object-cover" />
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{combo.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded ${combo.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {combo.active ? 'Activo' : 'Pausado'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">{combo.description}</p>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="text-xl font-bold text-indigo-600">${combo.price}</span>
                                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                                Stock: {combo.stock}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex gap-2 border-t pt-4">
                                            <a
                                                href={`/dashboard/combos/${combo.id}`}
                                                className="flex-1 text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:bg-gray-50 py-2 rounded"
                                            >
                                                Editar
                                            </a>
                                            <form action={toggleComboActive} className="flex-1">
                                                <input type="hidden" name="id" value={combo.id} />
                                                <input type="hidden" name="active" value={combo.active ? 'true' : 'false'} />
                                                <button
                                                    type="submit"
                                                    className={`w-full text-sm font-medium py-2 rounded ${combo.active ? 'text-orange-600 hover:text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:text-green-500 hover:bg-green-50'}`}
                                                >
                                                    {combo.active ? 'Pausar' : 'Activar'}
                                                </button>
                                            </form>
                                            <form action={deleteCombo} className="flex-1">
                                                <input type="hidden" name="id" value={combo.id} />
                                                <button
                                                    type="submit"
                                                    className="w-full text-sm font-medium text-red-600 hover:text-red-500 hover:bg-red-50 py-2 rounded"
                                                >
                                                    Eliminar
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="pedidos">
                        <h2 className="text-2xl font-bold mb-6">Pedidos Recibidos</h2>
                        {/* @ts-ignore Types issues with joins are common, verify manually */}
                        <PymeOrderList initialOrders={orders || []} />
                    </section>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Mis Compras</h1>
            <OrderList />
        </div>
    )
}

async function OrderList() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: orders } = await supabase
        .from('orders')
        .select(`
                *,
                combos (
                title,
                image_url
                )
                `)
        .eq('consumer_id', user.id)
        .order('created_at', { ascending: false })

    if (!orders || orders.length === 0) {
        return (
            <div className="mt-4">
                <p>No tienes pedidos recientes.</p>
                <a href="/browse" className="mt-4 inline-block rounded bg-indigo-600 px-4 py-2 text-white">Explorar Ofertas</a>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {/* @ts-ignore - Supabase join types can be tricky without generation */}
                        {order.combos?.image_url ? (
                            <img src={order.combos.image_url} alt={order.combos.title} className="h-full w-full object-cover object-center" />
                        ) : (
                            <div className="h-full w-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin img</div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between">
                            {/* @ts-ignore */}
                            <h3 className="font-bold text-lg">{order.combos?.title || 'Producto desconocido'}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {order.status === 'received' ? 'Recibido' :
                                    order.status === 'preparing' ? 'En preparación' :
                                        order.status === 'ready' ? 'Listo para retirar' :
                                            order.status}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">ID: {order.id.slice(0, 8)}</p>
                        <div className="mt-4 flex justify-between items-end">
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Total: ${order.total}
                            </span>
                            <span className="text-sm text-gray-400">
                                {new Date(order.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
