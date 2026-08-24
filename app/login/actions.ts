'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithGoogle(formData: FormData) {
    const role = formData.get('role') as string || 'consumer'
    const supabase = await createClient()

    // Pass the role in query params of redirectTo or options.data if Supabase supports it.
    // Ideally we put it in options.queryParams => Supabase Auth passes it back to callback.
    // OR options.data => It gets stored in raw_user_meta_data on signup! This is what we want.

    const headerList = await headers()
    const xHost = headerList.get('x-forwarded-host')
    const xProto = headerList.get('x-forwarded-proto')
    const host = xHost || headerList.get('host') || 'localhost:3000'
    const proto = xProto || 'http'

    let baseUrl = `${proto}://${host}`

    // If host is a real domain (not local), force https and ignore the detected proto if it's insecure
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0')
    if (!isLocal) {
        baseUrl = `https://${host}`
    } else if (process.env.NEXT_PUBLIC_BASE_URL && !process.env.NEXT_PUBLIC_BASE_URL.includes('localhost')) {
        // Fallback to env var if we are detected as local but a production URL is configured
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    }

    // Standardize URL
    baseUrl = baseUrl.replace(/\/$/, '')

    console.log('--- Auth Debug ---')
    console.log('Detected Host:', host)
    console.log('Detected Proto:', proto)
    console.log('Base URL:', baseUrl)

    const redirectUrl = `${baseUrl}/auth/callback?role=${role}`
    console.log('Requesting Redirect To:', redirectUrl)

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl,
        },
    })

    if (error) {
        console.error('--- Login Error ---')
        console.error('Code:', error.name)
        console.error('Message:', error.message)
        redirect(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }

    console.log('Supabase Generated OAuth URL:', data.url)

    if (data.url) {
        console.log('Redirecting to Supabase OAuth...')
        redirect(data.url)
    }

    console.error('Auth Error: No URL returned from Supabase')
    redirect('/auth/auth-code-error?error=NoUrlReturned')
}
