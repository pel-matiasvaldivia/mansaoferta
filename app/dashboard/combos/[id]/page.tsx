
import { createClient } from '@/utils/supabase/server'
import { updateCombo } from '../actions'
import { redirect } from 'next/navigation'

export default async function EditComboPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: combo } = await supabase
        .from('combos')
        .select('*')
        .eq('id', id)
        .eq('pyme_id', user.id)
        .single()

    if (!combo) {
        return <div>Combo no encontrado o no tienes permiso para editarlo.</div>
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Editar Combo</h1>
            <form action={updateCombo} className="space-y-6">
                <input type="hidden" name="id" value={combo.id} />

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Título del Combo
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        defaultValue={combo.title}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        rows={4}
                        defaultValue={combo.description}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Precio ($)
                        </label>
                        <input
                            type="number"
                            name="price"
                            id="price"
                            required
                            min="0"
                            step="0.01"
                            defaultValue={combo.price}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                        />
                    </div>

                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Stock Disponible
                        </label>
                        <input
                            type="number"
                            name="stock"
                            id="stock"
                            required
                            min="0"
                            defaultValue={combo.stock}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Imagen (Dejar vacío para mantener la actual)
                    </label>
                    {combo.image_url && (
                        <div className="mt-2 mb-2">
                            <img src={combo.image_url} alt="Actual" className="h-20 w-20 object-cover rounded" />
                        </div>
                    )}
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-800 dark:file:text-indigo-400"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Guardar Cambios
                    </button>
                    <a
                        href="/dashboard"
                        className="flex-1 text-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </a>
                </div>
            </form>
        </div>
    )
}
