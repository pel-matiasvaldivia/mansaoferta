'use client'

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Authentication Error
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    We encountered an issue logging you in.
                </p>
                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800 break-words">
                        {decodeURIComponent(error)}
                    </div>
                )}
                <div className="mt-6">
                    <Link
                        href="/login"
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <ErrorContent />
        </Suspense>
    )
}
