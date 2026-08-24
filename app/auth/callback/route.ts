import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const headerList = request.headers
    const xHost = headerList.get('x-forwarded-host')
    const xProto = headerList.get('x-forwarded-proto')
    const host = xHost || headerList.get('host') || 'localhost:3000'
    const proto = xProto || 'http'

    let origin = `${proto}://${host}`

    // Force https for production domains
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0')
    if (!isLocal && !origin.startsWith('https://')) {
        origin = `https://${host}`
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const role = searchParams.get('role')

    console.log('--- Auth Callback Debug ---')
    console.log('Host:', host)
    console.log('Proto:', proto)
    console.log('Origin:', origin)
    console.log('Has Code:', !!code)
    console.log('Role:', role)

    if (code) {
        try {
            const supabase = await createClient()
            console.log('Exchanging code for session...')
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Exchange Code Error:', error.message)
                return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
            }

            console.log('Session exchanged successfully.')

            if (role === 'pyme') {
                console.log('Updating pyme profile...')
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase
                        .from('profiles')
                        .update({ role: 'pyme' })
                        .eq('id', user.id)
                }
            }

            console.log('Redirecting to next:', next)
            return NextResponse.redirect(`${origin}${next}`)
        } catch (err) {
            console.error('Unhandled Callback Exception:', err)
            const msg = err instanceof Error ? err.message : 'Unknown error'
            return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(msg)}`)
        }
    }

    console.error('No code provided in callback')
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=NoCodeProvided`)
}
