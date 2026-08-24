import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { LogOut, Menu } from 'lucide-react'
import CartWidget from './CartWidget'

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                                MansaOferta
                            </span>
                        </Link>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
                        <Link href="/browse" className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600">
                            Explorar
                        </Link>

                        <CartWidget />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/dashboard" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Dashboard
                                </Link>
                                <form action="/auth/signout" method="post">
                                    <button className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Ingresar
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
