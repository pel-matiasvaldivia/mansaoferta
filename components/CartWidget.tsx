'use client'

import { useCart } from "@/context/CartContext"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function CartWidget() {
    const { items } = useCart()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const count = items.reduce((acc, item) => acc + item.quantity, 0)

    if (!mounted) {
        return (
            <Link href="/cart" className="relative p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                <ShoppingCart className="h-6 w-6" />
            </Link>
        )
    }

    return (
        <Link href="/cart" className="relative p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ShoppingCart className="h-6 w-6" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {count}
                </span>
            )}
        </Link>
    )
}
