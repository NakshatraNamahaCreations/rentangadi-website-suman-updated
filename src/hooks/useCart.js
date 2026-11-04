import { useDispatch, useSelector } from 'react-redux'
import {
  addToCart as addToCartAction,
  updateQty as updateQtyAction,
  setQty as setQtyAction,
  removeFromCart as removeFromCartAction,
  setShowCartPage as setShowCartPageAction,
  setShowOrdersPage as setShowOrdersPageAction,
  setShowConfirmedOrdersPage as setShowConfirmedOrdersPageAction,
  setShowProductsPage as setShowProductsPageAction,
  setShowAboutPage as setShowAboutPageAction,
  setShowContactPage as setShowContactPageAction,
  setCartLoginMode as setCartLoginModeAction,
  setProductSearch as setProductSearchAction,
  navigateTo as navigateToAction,
  addPlacedOrder as addPlacedOrderAction,
  clearCart as clearCartAction,
  loadUserCart as loadUserCartAction,
  clearOnLogout as clearOnLogoutAction,
  selectCart,
  selectShowCartPage,
  selectCartCount,
  selectCartTotal,
  selectShowOrdersPage,
  selectShowConfirmedOrdersPage,
  selectShowProductsPage,
  selectShowAboutPage,
  selectShowContactPage,
  selectCartLoginMode,
  selectProductSearch,
  selectPlacedOrders,
} from '../store/cartSlice'

export function useCart() {
  const dispatch = useDispatch()
  const cart = useSelector(selectCart)
  const showCartPage = useSelector(selectShowCartPage)
  const showOrdersPage = useSelector(selectShowOrdersPage)
  const showConfirmedOrdersPage = useSelector(selectShowConfirmedOrdersPage)
  const showProductsPage = useSelector(selectShowProductsPage)
  const showAboutPage = useSelector(selectShowAboutPage)
  const showContactPage = useSelector(selectShowContactPage)
  const cartLoginMode = useSelector(selectCartLoginMode)
  const productSearch = useSelector(selectProductSearch)
  const placedOrders = useSelector(selectPlacedOrders)
  const cartCount = useSelector(selectCartCount)
  const cartTotal = useSelector(selectCartTotal)

  return {
    cart,
    showCartPage,
    showOrdersPage,
    showConfirmedOrdersPage,
    showProductsPage,
    showAboutPage,
    showContactPage,
    cartLoginMode,
    productSearch,
    placedOrders,
    cartCount,
    cartTotal,
    addToCart: (item, qty = 1) => dispatch(addToCartAction({ ...item, qty })),
    updateQty: (id, delta) => dispatch(updateQtyAction({ id, delta })),
    setQty: (id, qty) => dispatch(setQtyAction({ id, qty })),
    removeFromCart: (id) => dispatch(removeFromCartAction(id)),
    setShowCartPage: (show) => dispatch(setShowCartPageAction(show)),
    setShowOrdersPage: (show) => dispatch(setShowOrdersPageAction(show)),
    setShowConfirmedOrdersPage: (show) =>
      dispatch(setShowConfirmedOrdersPageAction(show)),
    setShowProductsPage: (show) => dispatch(setShowProductsPageAction(show)),
    setShowAboutPage: (show) => dispatch(setShowAboutPageAction(show)),
    setShowContactPage: (show) => dispatch(setShowContactPageAction(show)),
    setCartLoginMode: (val) => dispatch(setCartLoginModeAction(val)),
    setProductSearch: (q) => dispatch(setProductSearchAction(q)),
    navigateTo: (page) => {
      dispatch(navigateToAction(page))
      window.dispatchEvent(new Event('nav-change'))
    },
    addPlacedOrder: (order) => dispatch(addPlacedOrderAction(order)),
    clearCart: () => dispatch(clearCartAction()),
    loadUserCart: () => dispatch(loadUserCartAction()),
    clearOnLogout: () => dispatch(clearOnLogoutAction()),
    getCartQty: (id) => {
      // We need a selector that takes id - use useSelector with a factory
      // But hooks can't be called conditionally. Use a custom hook or pass id.
      // Components call getCartQty(item.id) - we need to return a function that
      // reads from store. The simplest: return a function that components can call
      // with id, but we need access to state. Use store.getState() or...
      // Better: create a useCartQty(id) hook, but that changes the component API.
      // Alternative: getCartQty stays as a function(id) that returns the value.
      // We can use useSelector with a factory: useSelector(selectCartQty(id))
      // But that must be called at top level. So we need getCartQty to work differently.
      //
      // Easiest: getCartQty(id) reads from current cart. We have cart in scope.
      return cart.find((c) => c.id === id)?.qty ?? 0
    },
  }
}
