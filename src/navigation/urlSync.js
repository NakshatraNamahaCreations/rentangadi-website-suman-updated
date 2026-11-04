import { useEffect, useRef } from 'react'
import { useCart } from '../hooks/useCart'
import { useCategoryProducts } from '../context/CategoryProductsContext'
import { useProductDetails } from '../context/ProductDetailsContext'
import { getProducts, mapProductFromApi } from '../api/productApi'

/**
 * The site switches pages with state flags rather than routes, so every page
 * used to live at "/" and the browser had no history to go back through -
 * the back button, and the Android hardware back, left the site entirely.
 *
 * This keeps that state and the address bar in step: going somewhere pushes a
 * history entry, and going back restores the state that entry was taken from.
 * The paths are the ones the header links already point at, and
 * public/_redirects already serves index.html for all of them, so they survive
 * a refresh.
 */

/* Which page a set of flags means. The order matches how App renders them. */
export function pageFromFlags(f) {
  if (f.showConfirmedOrdersPage) return 'confirmed'
  if (f.showOrdersPage) return 'orders'
  if (f.showCartPage) return 'cart'
  if (f.showProductsPage) return 'products'
  if (f.showAboutPage) return 'about'
  if (f.showContactPage) return 'contact'
  return 'home'
}

const PAGE_PATH = {
  home: '/',
  products: '/products',
  about: '/about',
  contact: '/contact',
  orders: '/enquiries',
  cart: '/cart',
  confirmed: '/confirmed-enquiries',
}

const PATH_PAGE = Object.fromEntries(
  Object.entries(PAGE_PATH).map(([page, p]) => [p, page])
)

/**
 * The address for the current state. A product or a category view sits on top
 * of whatever page is underneath, which is why they are checked first.
 */
export function pathFor({ page, view, product }) {
  if (product?.id != null) return `/product/${encodeURIComponent(product.id)}`

  if (view?.categoryId != null) {
    const q = new URLSearchParams()
    if (view.categoryName) q.set('name', view.categoryName)
    if (view.subKey) q.set('sub', view.subKey)
    if (view.subLabel) q.set('subName', view.subLabel)
    const qs = q.toString()
    return `/category/${encodeURIComponent(view.categoryId)}${qs ? '?' + qs : ''}`
  }

  return PAGE_PATH[page] || '/'
}

/** What an address means, for a cold load or a history entry with no payload. */
export function parsePath(pathname, search) {
  const product = pathname.match(/^\/product\/([^/]+)\/?$/)
  if (product) return { kind: 'product', productId: decodeURIComponent(product[1]) }

  const category = pathname.match(/^\/category\/([^/]+)\/?$/)
  if (category) {
    const q = new URLSearchParams(search || '')
    return {
      kind: 'category',
      view: {
        categoryId: decodeURIComponent(category[1]),
        categoryName: q.get('name') || '',
        subKey: q.get('sub') || null,
        subLabel: q.get('subName') || '',
      },
    }
  }

  return { kind: 'page', page: PATH_PAGE[pathname.replace(/\/+$/, '') || '/'] || 'home' }
}

/* How many entries this app has pushed in this session. A visitor who landed
   straight on a deep link has none, and calling history.back() then would send
   them off the site. */
let pushed = 0

/**
 * For the "Back" controls the pages carry. Going back through history is what
 * those buttons mean, so that is what they now do - closing the page by hand
 * pushed a fresh entry instead, which left the browser's own back button
 * returning to the page the visitor had just dismissed.
 *
 * `fallback` runs when there is nothing of ours to go back to.
 */
export function goBack(fallback) {
  if (pushed > 0) {
    window.history.back()
    return
  }
  if (typeof fallback === 'function') fallback()
}

export function useUrlSync() {
  const cart = useCart()
  const { navigateTo } = cart
  const { view, openProductsPage } = useCategoryProducts()
  const { product, openProductDetails } = useProductDetails()

  const page = pageFromFlags(cart)
  const here = pathFor({ page, view, product })

  /* Nothing is pushed until the first address has been read, or a deep link
     would be overwritten by the home page before it ever rendered. */
  const booted = useRef(false)

  /* Restoring never pushes: the comparison below does that work, because by
     the time a popstate is handled the browser has already moved the address
     to the entry being restored. */
  const restore = useRef(null)
  restore.current = (target) => {
    if (!target) return

    if (target.kind === 'product' || target.product) {
      const p = target.product
      /* A history entry carries the product it was taken from. A cold link
         has only an id, so it is looked up in the list the app caches on
         start - that is what makes a shared product link work. */
      if (p) {
        navigateTo('home')
        openProductDetails(p, { source: target.source || 'home' })
      } else {
        getProducts()
          .then((list) => {
            /* getProducts answers with raw API records; the grids run them
               through mapProductFromApi before showing them, and the details
               page expects that same shape. */
            const found = (list || [])
              .map(mapProductFromApi)
              .filter(Boolean)
              .find((x) => String(x.id) === String(target.productId))
            navigateTo(found ? 'home' : 'products')
            if (found) openProductDetails(found, { source: 'home' })
          })
          .catch(() => navigateTo('products'))
      }
      return
    }

    if (target.kind === 'category' || target.view) {
      const v = target.view
      if (!v?.categoryId) {
        navigateTo('products')
        return
      }
      /* navigateTo fires nav-change, which clears any open view, so the base
         page is set first and the view opened after. */
      navigateTo(target.page || 'home')
      openProductsPage(v.categoryId, v.categoryName, v.subKey, v.subLabel)
      return
    }

    navigateTo(target.page || 'home')
  }

  /* First load: adopt whatever the address says. */
  useEffect(() => {
    const target = parsePath(window.location.pathname, window.location.search)
    const isHome = target.kind === 'page' && target.page === 'home'

    if (!isHome) restore.current(target)

    window.history.replaceState(
      { rentangadi: { page: isHome ? 'home' : null, ...target } },
      '',
      window.location.pathname + window.location.search
    )
    booted.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Any move to a new address becomes a history entry. The entry carries the
     view or product it was taken from, so going back restores it without
     another request. */
  useEffect(() => {
    if (!booted.current) return
    const at = window.location.pathname + window.location.search
    if (at === here) return

    window.history.pushState({ rentangadi: { page, view, product } }, '', here)
    pushed += 1
  }, [here, page, view, product])

  /* Back and forward, including the Android hardware back button. */
  useEffect(() => {
    const onPop = (e) => {
      if (pushed > 0) pushed -= 1
      const saved = e.state?.rentangadi
      restore.current(
        saved && (saved.product || saved.view || saved.page)
          ? {
              kind: saved.product ? 'product' : saved.view ? 'category' : 'page',
              ...saved,
            }
          : parsePath(window.location.pathname, window.location.search)
      )
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
}
