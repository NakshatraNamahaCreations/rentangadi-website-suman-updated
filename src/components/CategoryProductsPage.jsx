import { useState, useEffect, useLayoutEffect, useMemo } from 'react'
import { useCategoryProducts } from '../context/CategoryProductsContext'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useProductDetails } from '../context/ProductDetailsContext'
import QuantitySelector from './QuantitySelector'
import { ProductImageCarousel } from './GallerySection'
import { getProducts, mapProductFromApi } from '../api/productApi'
import './GallerySection.css'
import './CategorySection.css'
import './BestSellersSection.css'
import './CategoryProductsPage.css'

export default function CategoryProductsPage() {
  const { view, closeProductsPage, getReturnTarget, clearReturnTarget } = useCategoryProducts()
  const { addToCart, setQty, getCartQty, cartCount, setShowCartPage, navigateTo } = useCart()

  const handleBack = () => {
    const targetSubKey = getReturnTarget && getReturnTarget()
    closeProductsPage()
    navigateTo('products')

    if (!targetSubKey) return

    const id = `category-card-${targetSubKey}`
    let attempts = 0
    const tryScroll = () => {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' })
        if (clearReturnTarget) clearReturnTarget()
        return
      }
      // CategorySection fetches subcategories async; retry briefly.
      if (++attempts < 30) setTimeout(tryScroll, 80)
    }
    requestAnimationFrame(() => requestAnimationFrame(tryScroll))
  }

  const { isLoggedIn } = useAuth()
  const { openProductDetails, detailReturnScroll, consumeDetailReturnScroll } = useProductDetails()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterColor, setFilterColor] = useState('')
  const [filterSeater, setFilterSeater] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedQty, setSelectedQty] = useState({})
  

  // Extract unique filter values from products
  const filterOptions = useMemo(() => {
    const colors = new Set()
    const seaters = new Set()
    products.forEach((p) => {
      if (p.color) colors.add(p.color)
      if (p.seater) seaters.add(p.seater)
    })
    return {
      colors: [...colors].sort(),
      seaters: [...seaters].sort(),
    }
  }, [products])

  const activeFilterCount = [filterColor, filterSeater, sortBy].filter(Boolean).length

  const clearFilters = () => {
    setFilterColor('')
    setFilterSeater('')
    setSortBy('')
  }

  const displayedProducts = useMemo(() => {
    let result = products

    // Search — exact-name match wins; otherwise every query word must appear in the combined text.
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      const normalize = (str) =>
        (str || '')
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

      const normalizedQuery = normalize(q)
      const exact = result.filter((p) => normalize(p.name) === normalizedQuery)
      if (exact.length > 0) {
        result = exact
      } else {
        const words = normalizedQuery.split(' ').filter(Boolean)
        if (words.length) {
          // Skip subcategory/category — the page is already scoped to one,
          // so they would match every product and defeat the search.
          result = result.filter((p) => {
            const text = normalize(
              `${p.name || ''} ${p.material || ''} ${p.color || ''} ${p.seater || ''} ${p.dimensions || ''} ${p.description || ''}`
            )
            return words.every((w) => text.includes(w))
          })
        }
      }
    }

    // Filters
    if (filterColor) result = result.filter((p) => p.color === filterColor)
    if (filterSeater) result = result.filter((p) => p.seater === filterSeater)

    // Sort
    if (sortBy === 'price-low') result = [...result].sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-high') result = [...result].sort((a, b) => b.price - a.price)
    else if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [products, searchQuery, filterColor, filterSeater, sortBy])

  useEffect(() => {
    if (!view) return
    let cancelled = false
    async function fetchProducts() {
      setLoading(true)
      setError(null)
      try {
        // Use cached all-products (preloaded on app start) for instant loading
        const all = await getProducts()
        if (cancelled) return

        const categoryToSend = (view.categoryName || view.categoryId || '').toLowerCase().trim()
        let raw = all.filter(
          (p) => (p.ProductCategory || '').toLowerCase().trim() === categoryToSend
        )

        let mapped = raw
          .filter((item) => item?.ProductIcon)
          .map(mapProductFromApi)
          .filter(Boolean)

        if (view.subLabel && view.subKey !== 'all') {
          const subMatch = view.subLabel.toLowerCase().trim()
          mapped = mapped.filter(
            (p) => (p.productSubcategory || '').toLowerCase().trim() === subMatch
          )
        }
        setProducts(mapped)
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load products')
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [view?.categoryId, view?.subKey, view?.subLabel, view?.categoryName])

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(''), 2500)
    return () => clearTimeout(t)
  }, [toastMessage])

  useLayoutEffect(() => {
    if (!detailReturnScroll || detailReturnScroll.source !== 'category') return
    if (products.length === 0) return
    const el = document.getElementById(`category-product-${detailReturnScroll.productId}`)
    if (!el) {
      consumeDetailReturnScroll()
      return
    }
    el.scrollIntoView({ behavior: 'auto', block: 'center' })
    consumeDetailReturnScroll()
  }, [detailReturnScroll, products, consumeDetailReturnScroll])

  const handleAddToCart = (item, qty) => {
  if (!localStorage.getItem('token')) {
    try {
      const queue = JSON.parse(localStorage.getItem('rentangadi_pending_cart') || '[]')
      queue.push({ item, qty })
      localStorage.setItem('rentangadi_pending_cart', JSON.stringify(queue))
    } catch (_) {}
    window.dispatchEvent(new Event('open-login'))
    return
  }

  if (getCartQty(item.id) > 0) {
    setShowCartPage(true)
    return
  }

  addToCart(item, qty)
  setToastMessage('Added to cart')
}

  if (!view) return null

  return (
    <div className="category-products-page">
      <div className="category-products-page-header">
        <button
          type="button"
          className="cart-back-btn"
          onClick={handleBack}
        >
          Back
        </button>
        <h1 className="category-products-page-title">
          {view.categoryName} / {view.subLabel}
        </h1>
        <button
          type="button"
          className="category-products-cart-btn"
          onClick={() => setShowCartPage(true)}
          aria-label={`Cart ${cartCount} items`}
        >
          <svg className="category-products-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Cart {cartCount > 0 && <span className="category-products-cart-count">({cartCount})</span>}
        </button>
      </div>

      {/* Search bar */}
      <div className="cat-page-search-wrap">
        <svg className="cat-page-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          className="cat-page-search-input"
          placeholder={`Search in ${view.subLabel}…`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search products in category"
        />
        {searchQuery && (
          <button type="button" className="cat-page-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear">✕</button>
        )}
        <button
          type="button"
          className={`cat-page-filter-toggle${showFilters ? ' active' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Toggle filters"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="20" y2="12" />
            <line x1="12" y1="18" x2="20" y2="18" />
            <circle cx="6" cy="12" r="2" />
            <circle cx="10" cy="18" r="2" />
          </svg>
          {activeFilterCount > 0 && <span className="cat-page-filter-badge">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="cat-page-filters">
          <div className="cat-page-filters-row">
            <select className="cat-page-filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="">Sort by</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>

            {filterOptions.colors.length > 0 && (
              <select className="cat-page-filter-select" value={filterColor} onChange={(e) => setFilterColor(e.target.value)}>
                <option value="">All Colors</option>
                {filterOptions.colors.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {filterOptions.seaters.length > 0 && (
              <select className="cat-page-filter-select" value={filterSeater} onChange={(e) => setFilterSeater(e.target.value)}>
                <option value="">All Seaters</option>
                {filterOptions.seaters.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {activeFilterCount > 0 && (
              <button type="button" className="cat-page-filter-clear" onClick={clearFilters}>Clear All</button>
            )}
          </div>
          <p className="cat-page-filter-count">{displayedProducts.length} product{displayedProducts.length !== 1 ? 's' : ''} found</p>
        </div>
      )}

      <div className="category-products-page-content">
        {loading && (
          <div className="category-products-loading">Loading products…</div>
        )}
        {error && (
          <div className="category-products-error">{error}</div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="category-products-empty">No products found for this category.</div>
        )}
        {!loading && !error && products.length > 0 && displayedProducts.length === 0 && (
          <div className="category-products-empty">No products match your search.</div>
        )}
        <div className="best-sellers-grid">
          {displayedProducts.map((item) => {
            const inCartQty = getCartQty(item.id)
            return (
              <div
                key={item.id}
                id={`category-product-${item.id}`}
                className="best-sellers-card"
                onClick={() => openProductDetails(item, { source: 'category' })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openProductDetails(item, { source: 'category' })}
              >
                <div className="best-sellers-card-image-wrap">
                  <ProductImageCarousel
                    item={item}
                    onImageClick={() => openProductDetails(item, { source: 'category' })}
                  />
                </div>

                <div className="best-sellers-card-body">
                  <h3 className="best-sellers-card-title">{item.name}</h3>
                  {isLoggedIn && (
                    <span className="best-sellers-card-price">
                      ₹ {item.price.toLocaleString('en-IN')}
                    </span>
                  )}
                  <div
                    className="best-sellers-card-footer"
                    onClick={(e) => e.stopPropagation()}
                  >
                   

<QuantitySelector
  qty={inCartQty || selectedQty[item.id] || 1}
  onSetQty={(v) => {
    if (inCartQty > 0) {
      // ✅ already in cart → update redux
      setQty(item.id, v)
    } else {
      // ✅ before adding → store locally
      setSelectedQty(prev => ({
        ...prev,
        [item.id]: v
      }))
    }
  }}
  max={item.availableQty > 0 ? item.availableQty : Number(item.productStock) || 0}
/>
                    <button
  type="button"
  className={`product-add-btn${inCartQty > 0 ? ' product-add-btn--in-cart' : ''}`}
  onClick={(e) => {
    e.stopPropagation()

    const qty = selectedQty[item.id] || 1

    handleAddToCart(item, qty)
  }}
>
  {inCartQty > 0 ? 'Go to Cart' : 'Add to Cart'}
</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Added to cart toast */}
      {toastMessage && (
        <div className="category-products-toast" role="status" aria-live="polite">
          <span className="category-products-toast-icon">✓</span>
          {toastMessage}
        </div>
      )}
    </div>
  )
}
