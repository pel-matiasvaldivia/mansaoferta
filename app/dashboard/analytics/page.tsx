import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react'

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch all orders for this Pyme's combos
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            *,
            combos!inner(id, title, price, pyme_id)
        `)
        .eq('combos.pyme_id', user.id)

    // Calculate metrics
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0
    const totalOrders = orders?.length || 0
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate combo rankings
    const comboStats = new Map()

    orders?.forEach((order: any) => {
        const comboId = order.combos.id
        const comboTitle = order.combos.title
        const orderTotal = Number(order.total)

        if (!comboStats.has(comboId)) {
            comboStats.set(comboId, {
                id: comboId,
                title: comboTitle,
                units: 0,
                revenue: 0
            })
        }

        const stats = comboStats.get(comboId)
        stats.units += 1
        stats.revenue += orderTotal
    })

    const rankings = Array.from(comboStats.values())
        .sort((a, b) => b.revenue - a.revenue)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        <Link
                            href="/dashboard"
                            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            Mis Combos
                        </Link>
                        <Link
                            href="/dashboard"
                            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            Pedidos
                        </Link>
                        <Link
                            href="/dashboard/analytics"
                            className="border-b-2 border-indigo-600 py-4 px-1 text-sm font-medium text-indigo-600 dark:text-indigo-400"
                        >
                            Analíticas
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Analíticas de Ventas
                </h1>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Ingresos Totales
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    ${totalRevenue.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Pedidos
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    {totalOrders}
                                </p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                                <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Valor Promedio
                                </p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                                    ${avgOrderValue.toFixed(2)}
                                </p>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Combo Rankings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                            <Package className="h-6 w-6 mr-2 text-indigo-600" />
                            Ranking de Combos
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        {rankings.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                <p>No hay ventas registradas aún.</p>
                                <p className="text-sm mt-2">¡Empieza a vender para ver tus estadísticas!</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Posición
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Combo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Unidades Vendidas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Ingresos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            % del Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {rankings.map((combo, index) => {
                                        const percentage = (combo.revenue / totalRevenue * 100).toFixed(1)
                                        return (
                                            <tr key={combo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {index === 0 && (
                                                            <span className="text-2xl mr-2">🥇</span>
                                                        )}
                                                        {index === 1 && (
                                                            <span className="text-2xl mr-2">🥈</span>
                                                        )}
                                                        {index === 2 && (
                                                            <span className="text-2xl mr-2">🥉</span>
                                                        )}
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {combo.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {combo.units}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                        ${combo.revenue.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="text-sm text-gray-900 dark:text-white mr-2">
                                                            {percentage}%
                                                        </div>
                                                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                            <div
                                                                className="bg-indigo-600 h-2 rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
