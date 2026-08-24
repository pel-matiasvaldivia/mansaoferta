'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type Combo = {
    id: string
    title: string
    description: string
    price: number
    pyme_id: string
    image_url: string | null
}

type CartItem = Combo & {
    quantity: number
}

type CartContextType = {
    items: CartItem[]
    addItem: (combo: Combo) => void
    removeItem: (id: string) => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('cart')
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cart', JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addItem = (combo: Combo) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === combo.id)
            if (existing) {
                return prev.map((i) =>
                    i.id === combo.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prev, { ...combo, quantity: 1 }]
        })
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }

    const clearCart = () => setItems([])

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
