import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'

// Edge middleware protects /dashboard, /admin and /cart via authConfig.authorized.
export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/files|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
