'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// A product/service as stored in the client-side cart. Prices are plain numbers
// (Prisma Decimals are serialized before reaching the client).
export type CartProduct = {
    id: string
    title: string
    description: string | null
    price: number
    tenantId: string
    tenantName: string
    imageUrl: string | null
    type: 'PRODUCT' | 'SERVICE'
}

type CartItem = CartProduct & {
    quantity: number
}

type CartContextType = {
    items: CartItem[]
    addItem: (product: CartProduct) => void
    removeItem: (id: string) => void
    setQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Hydrate the cart from localStorage on mount. Deferred to an effect so the
    // server and first client render match (empty cart), then we sync the real
    // value — a legitimate external-store sync, hence the rule disable.
    useEffect(() => {
        try {
            const saved = localStorage.getItem('cart')
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (saved) setItems(JSON.parse(saved))
        } catch (e) {
            console.error('Failed to parse cart', e)
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('cart', JSON.stringify(items))
            } catch {
                // storage may be unavailable (private mode) — ignore
            }
        }
    }, [items, isLoaded])

    const addItem = (product: CartProduct) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === product.id)
            if (existing) {
                return prev.map((i) =>
                    i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }

    const setQuantity = (id: string, quantity: number) => {
        setItems((prev) =>
            prev
                .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i))
                .filter((i) => i.quantity > 0)
        )
    }

    const clearCart = () => setItems([])

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clearCart, total }}>
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
