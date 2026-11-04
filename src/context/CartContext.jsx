import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [showCartPage, setShowCartPage] = useState(false)

  const addToCart = (item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id)
      if (existing) {
        const newQty = Math.min(existing.qty + qty, item.availableQty)
        return prev.map((c) => (c.id === item.id ? { ...c, qty: newQty } : c))
      }
      return [...prev, { ...item, qty: Math.min(qty, item.availableQty) }]
    })
  }

  const updateQty = (id, delta) => {
    setCart((prev) => {
      const item = prev.find((c) => c.id === id)
      if (!item) return prev
      const newQty = Math.max(0, Math.min(item.qty + delta, item.availableQty))
      if (newQty === 0) return prev.filter((c) => c.id !== id)
      return prev.map((c) => (c.id === id ? { ...c, qty: newQty } : c))
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)
  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0)

  const getCartQty = (id) => cart.find((c) => c.id === id)?.qty ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        removeFromCart,
        cartCount,
        cartTotal,
        getCartQty,
        showCartPage,
        setShowCartPage,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
