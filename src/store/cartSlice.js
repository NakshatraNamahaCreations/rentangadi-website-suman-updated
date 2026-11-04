import { createSlice } from '@reduxjs/toolkit'

const PLACED_ORDERS_KEY = 'rentangadi_placed_orders'

function getUserId() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    return u?._id || u?.id || ''
  } catch { return '' }
}

function cartKey(uid) {
  return uid ? `rentangadi_cart_${uid}` : ''
}

const loadPlacedOrders = () => {
  try {
    const raw = localStorage.getItem(PLACED_ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const loadCartForUser = (uid) => {
  if (!uid) return []
  try {
    const raw = localStorage.getItem(cartKey(uid))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const saveCartForUser = (items) => {
  const uid = getUserId()
  if (!uid) return
  try {
    localStorage.setItem(cartKey(uid), JSON.stringify(items))
  } catch (_) {}
}

// On app start, load cart for currently logged-in user (if any)
const initialUserId = getUserId()

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartForUser(initialUserId),
    showCartPage: false,
    showOrdersPage: false,
    showConfirmedOrdersPage: false,
    showProductsPage: false,
    showAboutPage: false,
    showContactPage: false,
    cartLoginMode: false,
    productSearch: '',
    placedOrders: loadPlacedOrders(),
  },
  reducers: {
   addToCart: (state, action) => {
  const { qty: qtyArg, ...item } = action.payload
  const qty = qtyArg ?? 1

  const existing = state.items.find((c) => c.id === item.id)

  const stockFallback = Number(item.productStock) > 0 ? Number(item.productStock) : Infinity
  const maxQty = item.availableQty > 0 ? item.availableQty : stockFallback

  if (existing) {
    existing.qty = Math.min(existing.qty + qty, maxQty)
  } else {
    state.items.push({
      ...item,
      qty: Math.min(qty, maxQty)
    })
  }

  saveCartForUser(state.items)
},
   updateQty: (state, action) => {
  const { id, delta } = action.payload

  state.items = state.items
    .map((item) => {
      if (item.id !== id) return item

      const stockFallback = Number(item.productStock) > 0 ? Number(item.productStock) : Infinity
      const cap = item.availableQty > 0 ? item.availableQty : stockFallback
      const newQty = Math.max(0, Math.min(item.qty + delta, cap))

      if (newQty === 0) return null

      return { ...item, qty: newQty }
    })
    .filter(Boolean)

  saveCartForUser(state.items)
},
   setQty: (state, action) => {
  const { id, qty } = action.payload

  state.items = state.items
    .map((item) => {
      if (item.id !== id) return item

      const stockFallback = Number(item.productStock) > 0 ? Number(item.productStock) : Infinity
      const cap = item.availableQty > 0 ? item.availableQty : stockFallback
      const newQty = Math.max(0, Math.min(qty, cap))

      if (newQty === 0) return null

      return { ...item, qty: newQty }
    })
    .filter(Boolean)

  saveCartForUser(state.items)
},
    removeFromCart: (state, action) => {
      state.items = state.items.filter((c) => c.id !== action.payload)
      saveCartForUser(state.items)
    },
    // Load cart for a specific user (called after login)
    loadUserCart: (state) => {
      const uid = getUserId()
      state.items = loadCartForUser(uid)
    },
    // Clear cart in redux (called on logout) — already saved per-user
    clearOnLogout: (state) => {
      state.items = []
    },
    setShowCartPage: (state, action) => {
      state.showCartPage = action.payload
      if (action.payload) state.showOrdersPage = false
    },
    setShowOrdersPage: (state, action) => {
      state.showOrdersPage = action.payload
    },
    setShowConfirmedOrdersPage: (state, action) => {
      state.showConfirmedOrdersPage = action.payload
    },
    setShowProductsPage: (state, action) => {
      state.showProductsPage = action.payload
    },
    setShowAboutPage: (state, action) => {
      state.showAboutPage = action.payload
    },
    setShowContactPage: (state, action) => {
      state.showContactPage = action.payload
    },
    setCartLoginMode: (state, action) => {
      state.cartLoginMode = action.payload
    },
    setProductSearch: (state, action) => {
      state.productSearch = action.payload
    },
    navigateTo: (state, action) => {
      state.showCartPage = false
      state.showOrdersPage = false
      state.showConfirmedOrdersPage = false
      state.showProductsPage = false
      state.showAboutPage = false
      state.showContactPage = false
      const page = action.payload
      if (page === 'cart')      state.showCartPage = true
      if (page === 'orders')    state.showOrdersPage = true
      if (page === 'confirmed') state.showConfirmedOrdersPage = true
      if (page === 'products')  state.showProductsPage = true
      if (page === 'about')     state.showAboutPage = true
      if (page === 'contact')   state.showContactPage = true
    },
    addPlacedOrder: (state, action) => {
      const order = { id: Date.now().toString(), ...action.payload }
      state.placedOrders.unshift(order)
      try {
        localStorage.setItem(PLACED_ORDERS_KEY, JSON.stringify(state.placedOrders))
      } catch (_) {}
    },
    clearCart: (state) => {
      state.items = []
      saveCartForUser([])
    },
  },
})

export const {
  addToCart,
  updateQty,
  setQty,
  removeFromCart,
  loadUserCart,
  clearOnLogout,
  setShowCartPage,
  setShowOrdersPage,
  setShowConfirmedOrdersPage,
  setShowProductsPage,
  setShowAboutPage,
  setShowContactPage,
  setCartLoginMode,
  setProductSearch,
  navigateTo,
  addPlacedOrder,
  clearCart,
} = cartSlice.actions

export const selectCart = (state) => state.cart.items
export const selectShowCartPage = (state) => state.cart.showCartPage
export const selectCartCount = (state) => state.cart.items.length
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, c) => sum + c.price * c.qty, 0)
export const selectShowOrdersPage = (state) => state.cart.showOrdersPage
export const selectShowConfirmedOrdersPage = (state) =>
  state.cart.showConfirmedOrdersPage
export const selectShowProductsPage = (state) => state.cart.showProductsPage
export const selectShowAboutPage = (state) => state.cart.showAboutPage
export const selectShowContactPage = (state) => state.cart.showContactPage
export const selectCartLoginMode = (state) => state.cart.cartLoginMode
export const selectProductSearch = (state) => state.cart.productSearch
export const selectPlacedOrders = (state) => state.cart.placedOrders
export default cartSlice.reducer
