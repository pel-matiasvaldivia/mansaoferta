'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { registerAction } from '../actions'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined)
  const [accountType, setAccountType] = useState<'consumer' | 'pyme'>('consumer')

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <p className="mt-1 text-sm text-gray-500">Comprá ofertas o vendé como pyme.</p>

      <form action={formAction} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(['consumer', 'pyme'] as const).map((type) => (
            <label
              key={type}
              className={`cursor-pointer rounded-md border p-3 text-center text-sm font-medium ${
                accountType === type
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <input
                type="radio" name="accountType" value={type} className="sr-only"
                checked={accountType === type}
                onChange={() => setAccountType(type)}
              />
              {type === 'consumer' ? 'Soy consumidor' : 'Soy una pyme'}
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium" htmlFor="name">Nombre</label>
          <input id="name" name="name" type="text" required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </div>

        {accountType === 'pyme' && (
          <div>
            <label className="block text-sm font-medium" htmlFor="companyName">Nombre del negocio</label>
            <input id="companyName" name="companyName" type="text"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="password">Contraseña</label>
          <input id="password" name="password" type="password" required autoComplete="new-password" minLength={8}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </div>

        {state?.error && (
          <p className="rounded bg-red-100 p-2 text-sm text-red-700">{state.error}</p>
        )}

        <button type="submit" disabled={pending}
          className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}
