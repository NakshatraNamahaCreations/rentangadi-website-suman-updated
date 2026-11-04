import { useEffect, useLayoutEffect, useState, useMemo, useRef } from 'react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useProductDetails } from '../context/ProductDetailsContext'
import { getProducts } from '../api/productApi'
import QuantitySelector from './QuantitySelector'
import { ProductImageCarousel } from './GallerySection'
import { resolveProductImage } from '../api/config'
import { getMobileHoverImageUrl } from '../utils/mobileClickedHover'
import {
  isPinkHectorThreeSeater,
  PINK_HECTOR_THREE_SEATER_GALLERY,
} from '../utils/pinkHectorGallery'
import './GallerySection.css'
import './BestSellersSection.css'

const INITIAL_COUNT = 8

const CATEGORY_TABS = ['All', 'Sofas', 'Chairs', 'Tables', 'Others']

const SOFAS_RE  = /sofa|lounge|divan|bench|settee/i
const CHAIRS_RE = /chair|stool|ottoman|boho|mantap/i
const TABLES_RE = /dining|dinning|center\s*table|side\s*table|console\s*table/i

function matchesTab(p, tab) {
  const sub = (p.productSubcategory || '') + ' ' + (p.productCategory || '')
  switch (tab) {
    case 'Sofas':  return SOFAS_RE.test(sub)
    case 'Chairs': return CHAIRS_RE.test(sub)
    case 'Tables': return TABLES_RE.test(sub)
    case 'Others': return !SOFAS_RE.test(sub) && !CHAIRS_RE.test(sub) && !TABLES_RE.test(sub)
    default:       return true
  }
}

/** Keeps grid data across unmount (e.g. product details) so return-to-home is instant. */
let bestSellersCachedProducts = null

function BestSellersSection() {
  const [products, setProducts] = useState(() => bestSellersCachedProducts ?? [])
  const [activeTab, setActiveTab] = useState('All')
  const [showAll, setShowAll] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { addToCart, setQty, getCartQty, productSearch, cart, setShowCartPage } = useCart()
  const { isLoggedIn } = useAuth()
  const [selectedQty, setSelectedQty] = useState({})
  const qtyRef = useRef({})
  
  

  // When global search is active, show all tabs and expand
  useEffect(() => {
    if (productSearch) {
      setActiveTab('All')
      setShowAll(true)
    }
  }, [productSearch])
  const { openProductDetails, detailReturnScroll, consumeDetailReturnScroll } = useProductDetails()

  useLayoutEffect(() => {
    if (!detailReturnScroll || detailReturnScroll.source !== 'home') return
    if (products.length === 0) return
    const el = document.getElementById(`best-seller-${detailReturnScroll.productId}`)
    if (!el) {
      consumeDetailReturnScroll()
      return
    }
    el.scrollIntoView({ behavior: 'auto', block: 'center' })
    consumeDetailReturnScroll()
  }, [detailReturnScroll, products, consumeDetailReturnScroll])

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(''), 2500)
    return () => clearTimeout(t)
  }, [toastMessage])

  useEffect(() => {
    let cancelled = false
    async function fetchProducts() {
      try {
        const productArray = await getProducts()
        if (cancelled) return

        const sorted = Array.isArray(productArray)
          ? [...productArray].sort(
              (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            )
          : []

        const mapped = sorted
  .filter((item) => item.ProductIcon)
  .map((item) => {
    const imgUrl = resolveProductImage(item.ProductIcon)
    const name = item.ProductName || ''
    const usePinkHectorGallery = isPinkHectorThreeSeater(name)
    const hoverImage = usePinkHectorGallery ? undefined : getMobileHoverImageUrl(name)
    

    // ✅ Use backend images array if available, else fall back to ProductIcon
  const backendImages = Array.isArray(item.images) && item.images.length > 0
  ? item.images.map(img => ({
      url: typeof img === 'object' ? img.url : img,
      color: img?.color || null,
    })).filter(img => img.url)
  : null

  const mainColor = item.Color || null
  const images = usePinkHectorGallery
  ? [
      { url: imgUrl, color: mainColor },
      ...PINK_HECTOR_THREE_SEATER_GALLERY.map(url => ({ url, color: null })),
    ]
  : backendImages
  ? [
      { url: imgUrl, color: mainColor }, // main image first
      ...backendImages.filter(img => img.url !== imgUrl),
    ]
  : [{ url: imgUrl, color: mainColor }]

    return {
      id: item._id,
      productCode: item.ProductCode || item._id?.slice(-6) || '',
      name,
      description: item.ProductDesc || '',
      price: Number(item.ProductPrice) || 0,
      dimensions: item.ProductSize || '',
      availableQty: Number(item.qty ?? item.StockAvailable ?? item.ProductStock) || 0,
      src: imgUrl,
      images,                          // ✅ now has all backend images
      rawImages: item.images || [],    // ✅ preserve { url, color } objects for details page
      productSubcategory: item.ProductSubcategory || '',
      productCategory: item.ProductCategory || '',
      productStock: item.ProductStock,
      stockAvailable: item.StockAvailable,
      repairCount: item.repairCount ?? 0,
      lostCount: item.lostCount ?? 0,
      seater: item.seater || '',
      material: item.Material || '',
      color: item.Color || '',
      minQty: item.minqty || '',
      productStatus: item.ProductStatus || '',
      activeStatus: item.activeStatus ?? true,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      dates: item.Dates || [],
      inventory: item.inventory || [],
      ...(hoverImage ? { hoverImage } : {}),
    }
  })

        if (!cancelled) {
          bestSellersCachedProducts = mapped
          setProducts(mapped)
        }
      } catch (err) {
        if (!cancelled) console.error('PRODUCT API ERROR:', err)
      }
    }
    fetchProducts()
    return () => { cancelled = true }
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setShowAll(false)
  }

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

  // 🔥 IMPORTANT: sync local state
  setSelectedQty(prev => ({
    ...prev,
    [item.id]: qty
  }))

  setToastMessage('Added to cart')
}
 const filtered = useMemo(() => {
  const q = (searchQuery || productSearch || '').toLowerCase().trim()

  return products.filter((p) => {
    if (!matchesTab(p, activeTab)) return false
    if (!q) return true

    const normalize = (str) =>
      str.toLowerCase().replace(/[^a-z0-9\s]/g, '')

    const text = normalize(
      `${p.name || ''} ${p.productSubcategory || ''} ${p.productCategory || ''} ${p.description || ''} ${p.material || ''} ${p.color || ''} ${p.seater || ''} ${p.dimensions || ''}`
    )

    const words = normalize(q).split(/\s+/).filter(Boolean)
    if (!words.length) return false

    // ✅ ALL WORDS MUST MATCH
    return words.every(word => text.includes(word))
  })
}, [products, activeTab, searchQuery, productSearch])

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_COUNT)
  const hiddenCount = filtered.length - INITIAL_COUNT

  return (
    <section className="best-sellers-section" id="best-sellers-section">
      <div className="best-sellers-container">

        <span className="best-sellers-label">Browse</span>
        <h2 className="best-sellers-title">Our Collection</h2>

        {/* Search bar */}
        <div className="bs-search-wrap">
          <svg className="bs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className="bs-search-input"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowAll(false) }}
            aria-label="Search products"
          />
          {searchQuery && (
            <button type="button" className="bs-search-clear" onClick={() => { setSearchQuery(''); setShowAll(false) }} aria-label="Clear">✕</button>
          )}
        </div>

        {/* Category tabs */}
        <div className="bs-tabs">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`bs-tab${activeTab === tab ? ' bs-tab-active' : ''}`}
              onClick={() => handleTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="best-sellers-grid">
          {displayed.length === 0 && (
            <p className="bs-empty">
              {searchQuery || productSearch
                ? `No products found for "${searchQuery || productSearch}"`
                : 'No products in this category yet.'}
            </p>
          )}
          {displayed.map((item) => {
            const inCartQty = getCartQty(item.id)
            return (
              <div
                key={item.id}
                id={`best-seller-${item.id}`}
                className="best-sellers-card"
                onClick={() => openProductDetails(item, { source: 'home' })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openProductDetails(item, { source: 'home' })}
              >
                <div className="best-sellers-card-image-wrap">
                  <ProductImageCarousel
                    item={item}
                    onImageClick={() => openProductDetails(item, { source: 'home' })}
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
  qty={selectedQty[item.id] || 1}
  onSetQty={(v) => {
    if (inCartQty > 0) {
      setQty(item.id, v) // 🔥 updates Redux
    } else {
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

        {/* View More */}
        {!showAll && hiddenCount > 0 && (
          <div className="bs-view-more-wrap">
            <button
              type="button"
              className="bs-view-more-btn"
              onClick={() => setShowAll(true)}
            >
              View More ({hiddenCount} more)
            </button>
          </div>
        )}

      </div>

      {toastMessage && (
        <div className="best-sellers-add-to-cart-toast" role="status" aria-live="polite">
          <span className="best-sellers-toast-icon">✓</span>
          {toastMessage}
        </div>
      )}
    </section>
  )
}

export default BestSellersSection
