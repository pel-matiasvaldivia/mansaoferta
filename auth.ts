import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { authConfig } from '@/auth.config'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const googleEnabled = !!process.env.AUTH_GOOGLE_ID && !!process.env.AUTH_GOOGLE_SECRET

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        })
        if (!user?.passwordHash) return null

        const ok = await verifyPassword(user.passwordHash, parsed.data.password)
        if (!ok) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          globalRole: user.globalRole,
        }
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
})
