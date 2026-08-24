'use client'

import { useActionState } from 'react'
import { updateTenantProfile } from './actions'

type Initial = {
  name: string
  address: string
  city: string
  phone: string
  hasMpToken: boolean
  logoUrl: string | null
}

export default function SettingsForm({ initial }: { initial: Initial }) {
  const [state, action, pending] = useActionState(updateTenantProfile, undefined)

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-center gap-4">
        {initial.logoUrl && (
          <img src={initial.logoUrl} alt="logo" className="h-16 w-16 rounded-full object-cover" />
        )}
        <div className="flex-1">
          <label className="block text-sm font-medium" htmlFor="logo">Logo</label>
          <input id="logo" name="logo" type="file" accept="image/*" className="mt-1 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="name">Nombre del negocio</label>
        <input id="name" name="name" defaultValue={initial.name} required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="city">Ciudad</label>
          <input id="city" name="city" defaultValue={initial.city}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="phone">Teléfono</label>
          <input id="phone" name="phone" defaultValue={initial.phone}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="address">Dirección</label>
        <input id="address" name="address" defaultValue={initial.address}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="mpToken">
          Token de MercadoPago {initial.hasMpToken && <span className="text-green-600">(configurado)</span>}
        </label>
        <input id="mpToken" name="mpToken" type="password" placeholder={initial.hasMpToken ? '•••••••• (dejar vacío para no cambiar)' : 'APP_USR-...'}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900" />
        <p className="mt-1 text-xs text-gray-400">Se guarda encriptado. Nunca se muestra ni se expone públicamente.</p>
      </div>

      {state?.error && <p className="rounded bg-red-100 p-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded bg-green-100 p-2 text-sm text-green-700">Guardado.</p>}

      <button type="submit" disabled={pending}
        className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
    </form>
  )
}
