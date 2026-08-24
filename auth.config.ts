import type { NextAuthConfig } from 'next-auth'

// Edge-safe Auth.js config shared with the middleware. It must NOT import the
// Prisma adapter, argon2, or anything Node-only — those live in ./auth.ts.
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    // Route protection used by the middleware.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const path = nextUrl.pathname
      const isProtected =
        path.startsWith('/dashboard') ||
        path.startsWith('/admin') ||
        path.startsWith('/orders') ||
        path.startsWith('/cart')
      if (isProtected) return isLoggedIn
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // `globalRole` is attached by the Credentials/adapter user object.
        token.globalRole = (user as { globalRole?: string }).globalRole ?? 'USER'
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.globalRole = (token.globalRole as string) ?? 'USER'
      }
      return session
    },
  },
  providers: [], // real providers are added in ./auth.ts
} satisfies NextAuthConfig
