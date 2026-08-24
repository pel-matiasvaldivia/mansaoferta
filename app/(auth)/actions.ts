'use server'

import { z } from 'zod'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { signIn } from '@/auth'
import { uniqueSlug } from '@/lib/slug'

export type AuthState = { error?: string } | undefined

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos.' }
    }
    throw error // re-throw the redirect
  }
}

const registerSchema = z
  .object({
    name: z.string().min(2, 'Ingresá tu nombre'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    accountType: z.enum(['consumer', 'pyme']),
    companyName: z.string().optional(),
  })
  .refine((d) => d.accountType !== 'pyme' || (d.companyName && d.companyName.length >= 2), {
    message: 'Ingresá el nombre de tu negocio',
    path: ['companyName'],
  })

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    accountType: formData.get('accountType'),
    companyName: formData.get('companyName'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }
  const { name, email, password, accountType, companyName } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return { error: 'Ya existe una cuenta con ese email.' }
  }

  const passwordHash = await hashPassword(password)

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      name,
      passwordHash,
      // A pyme account also gets its own tenant + owner membership.
      ...(accountType === 'pyme' && companyName
        ? {
            memberships: {
              create: {
                role: 'OWNER',
                tenant: { create: { name: companyName, slug: uniqueSlug(companyName) } },
              },
            },
          }
        : {}),
    },
  })

  try {
    await signIn('credentials', {
      email: normalizedEmail,
      password,
      redirectTo: accountType === 'pyme' ? '/dashboard/settings' : '/browse',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Cuenta creada, pero falló el ingreso. Probá iniciar sesión.' }
    }
    throw error
  }
}
