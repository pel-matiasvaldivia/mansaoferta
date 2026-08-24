import { createCombo } from "../actions";

export default function NewComboPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-bold">Publicar Nuevo Combo</h1>
            <form action={createCombo} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Título del Combo
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Ej: Media docena de empanadas + bebida"
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
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                        placeholder="Detalla qué incluye el combo..."
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
                            min="1"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Imagen del Producto
                    </label>
                    <input
                        type="file"
                        name="image"
                        id="image"
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-800 dark:file:text-indigo-400"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Publicar Combo
                </button>
            </form>
        </div>
    );
}
