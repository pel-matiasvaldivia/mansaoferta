'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { loginAction } from '../actions'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined)

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <p className="mt-1 text-sm text-gray-500">Ingresá a tu cuenta de MansaOferta.</p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" required autoComplete="email"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="password">Contraseña</label>
          <input
            id="password" name="password" type="password" required autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        {state?.error && (
          <p className="rounded bg-red-100 p-2 text-sm text-red-700">{state.error}</p>
        )}

        <button
          type="submit" disabled={pending}
          className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ingresar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  )
}
