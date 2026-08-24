import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updatePymeProfile } from './actions'

export default async function SetupPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, profile_completed')
        .eq('id', user.id)
        .single()

    // Redirect if not Pyme or already completed
    if (profile?.role !== 'pyme') {
        redirect('/dashboard')
    }

    if (profile?.profile_completed) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
            <div className="mx-auto max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        ¡Bienvenido a MansaOferta! 🎉
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Completa tu perfil de vendedor para empezar a publicar ofertas
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <form action={updatePymeProfile} className="space-y-8">
                        {/* Step 1: Company Info */}
                        <div className="border-b pb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
                                Información de tu Negocio
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Nombre del Negocio *
                                    </label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        id="company_name"
                                        required
                                        placeholder="Ej: Pizzería Don Juan"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Teléfono de Contacto *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        required
                                        placeholder="Ej: +54 9 11 1234-5678"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Location */}
                        <div className="border-b pb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
                                Ubicación
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Dirección *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        id="address"
                                        required
                                        placeholder="Ej: Av. Corrientes 1234"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Ciudad *
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        id="city"
                                        required
                                        placeholder="Ej: Buenos Aires"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Branding */}
                        <div className="border-b pb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
                                Logo del Negocio
                            </h2>
                            <div>
                                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Subir Logo (Opcional)
                                </label>
                                <input
                                    type="file"
                                    name="logo"
                                    id="logo"
                                    accept="image/*"
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-indigo-400"
                                />
                                <p className="mt-2 text-sm text-gray-500">Recomendado: 400x400px, formato PNG o JPG</p>
                            </div>
                        </div>

                        {/* Step 4: Payment */}
                        <div className="pb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
                                Configuración de Pagos
                            </h2>
                            <div>
                                <label htmlFor="mercadopago_token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mercado Pago Access Token (Opcional)
                                </label>
                                <input
                                    type="text"
                                    name="mercadopago_token"
                                    id="mercadopago_token"
                                    placeholder="APP_USR-..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        <strong>¿Cómo obtener tu token?</strong><br />
                                        1. Ingresa a <a href="https://www.mercadopago.com.ar/developers" target="_blank" className="underline">Mercado Pago Developers</a><br />
                                        2. Ve a "Tus integraciones" → "Credenciales"<br />
                                        3. Copia tu "Access Token" de producción
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                Completar Configuración y Empezar a Vender 🚀
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
