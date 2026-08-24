import { signInWithGoogle } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
    const { role: rawRole } = await searchParams
    const role = rawRole === 'pyme' ? 'pyme' : 'consumer'
    const isPyme = role === 'pyme'

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isPyme ? 'Acceso Vendedores' : 'Ingresar a mi cuenta'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isPyme
                            ? 'Publica tus ofertas y llega a más clientes.'
                            : 'Bienvenido a MansaOferta.com.ar'}
                    </p>
                </div>
                <form action={signInWithGoogle} className="mt-8 space-y-6">
                    <input type="hidden" name="role" value={role} />
                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        {isPyme ? 'Ingresar como Vendedor' : 'Ingresar con Google'}
                    </button>
                    {isPyme && (
                        <div className="text-center mt-4">
                            <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                                ¿Eres un comprador? Ingresa aquí
                            </a>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
