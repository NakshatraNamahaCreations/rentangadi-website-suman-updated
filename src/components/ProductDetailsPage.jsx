import { useState, useEffect, useRef } from 'react'
import { useProductDetails } from '../context/ProductDetailsContext'
import { useCart } from '../hooks/useCart'
import { goBack } from '../navigation/urlSync'
import { useAuth } from '../hooks/useAuth'
import QuantitySelector from './QuantitySelector'
import './ProductDetailsPage.css'

// Override CSS colour keywords whose default rendering does not match
// how the product team names them (e.g. CSS `gold` is #FFD700, a bright
// yellow — designers usually mean metallic gold). Add more overrides
// here as the palette grows; unmapped names fall through to the raw CSS
// keyword unchanged.
const COLOR_HEX_OVERRIDES = {
  gold: '#D4AF37',
}

const resolveSwatchColor = (name) => {
  const key = String(name || '').trim().toLowerCase()
  return COLOR_HEX_OVERRIDES[key] || key
}

export default function ProductDetailsPage() {
  const { product: ctxProduct, closeProductDetails } = useProductDetails()
  const { addToCart, setQty, getCartQty, cartCount, setShowCartPage } = useCart()
  const { isLoggedIn } = useAuth()
 const [toastMessage, setToastMessage] = useState('')
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedQty, setSelectedQty] = useState({})
  const thumbsRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ctxProduct?.id])

  useEffect(() => {
    setImgIdx(0)
  }, [selectedColor])

  if (!ctxProduct) return null

  const product = ctxProduct

  useEffect(() => {
      if (!toastMessage) return
      const t = setTimeout(() => setToastMessage(''), 2500)
      return () => clearTimeout(t)
    }, [toastMessage])

  // ✅ Normalize images
  const images = (product.images || []).map(img =>
    typeof img === 'object'
      ? img
      : { url: img, color: null }
  )

  // ✅ 🔥 GROUP IMAGES BY COLOR (NEW)
  const imagesByColor = images.reduce((acc, img) => {
    const key = img.color || "default"
    if (!acc[key]) acc[key] = []
    acc[key].push(img)
    return acc
  }, {})

  // ✅ 🔥 CURRENT IMAGES BASED ON COLOR (NEW)
  const currentImages = selectedColor
    ? imagesByColor[selectedColor] || []
    : images

  // ✅ CURRENT IMAGE
  const currentImg =
    currentImages[imgIdx]?.url || currentImages[0]?.url

  const inCartQty = getCartQty(product.id)

  // ✅ UPDATED NAVIGATION
  const goPrev = () =>
    setImgIdx(prev => (prev - 1 + currentImages.length) % currentImages.length)

  const goNext = () =>
    setImgIdx(prev => (prev + 1) % currentImages.length)

  useEffect(() => {
    const el = thumbsRef.current
    if (!el) return
    const active = el.children[imgIdx]
    if (!active) return
    const elRect = el.getBoundingClientRect()
    const pad = 6

    // Show one thumbnail on each side of the active one for preview context.
    const lookbehind = el.children[imgIdx - 1] || active
    const lookahead = el.children[imgIdx + 1] || active
    const lookbehindRect = lookbehind.getBoundingClientRect()
    const lookaheadRect = lookahead.getBoundingClientRect()

    if (lookbehindRect.left < elRect.left + pad) {
      // Previous thumb is off the left edge — scroll left to reveal it
      el.scrollBy({ left: lookbehindRect.left - elRect.left - pad, behavior: 'smooth' })
    } else if (lookaheadRect.right > elRect.right - pad) {
      // Next thumb is off the right edge — scroll right to reveal it
      el.scrollBy({ left: lookaheadRect.right - elRect.right + pad, behavior: 'smooth' })
    }
  }, [imgIdx, selectedColor])

  const qty = selectedQty[product.id] ?? inCartQty ?? 1

  return (
    <>
    <div className="product-details-page">
      
      <div className="product-details-header">
        <button
          className="cart-back-btn"
          onClick={() => goBack(closeProductDetails)}
        >
          Back
        </button>

        <h1 className="product-details-page-title">{product.name}</h1>

        <button
          className="category-products-cart-btn"
          onClick={() => setShowCartPage(true)}
        >
          Cart {cartCount > 0 && `(${cartCount})`}
        </button>
      </div>

      <div className="product-details-content">

        {/* IMAGE SECTION */}
        <div className="product-details-image-wrap">

          <div className="product-image-box">
            {currentImages.length > 1 && (
              <button className="carousel-arrow carousel-arrow--prev" onClick={goPrev} aria-label="Previous image">
                ‹
              </button>
            )}

            {currentImg && (
              <img
                src={currentImg}
                alt={product.name}
                className="product-details-image"
              />
            )}

            {currentImages.length > 1 && (
              <button className="carousel-arrow carousel-arrow--next" onClick={goNext} aria-label="Next image">
                ›
              </button>
            )}
          </div>

          {/* ✅ THUMBNAILS CAROUSEL */}
          {currentImages.length > 1 && (
            <div className="product-thumbnails-wrap">
              <div className="product-thumbnails" ref={thumbsRef}>
                {currentImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`${product.name} view ${idx + 1}`}
                    className={`thumbnail ${idx === imgIdx ? 'active' : ''}`}
                    onClick={() => setImgIdx(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* INFO SECTION */}
        <div className="product-details-info">

          <h2 className="product-details-name">{product.name}</h2>

{product.description && (
  <p className="product-details-desc">
    {product.description}
  </p>
)}

          {/* COLOR SELECTOR */}
          {(() => {
            const imageColors = [...new Set(images.map(img => img.color).filter(Boolean))]
            const displayColors = imageColors.length > 0
              ? imageColors
              : (product.color ? [product.color] : [])

            if (displayColors.length === 0) return null

            return (
              <div className="color-selector">
                <p className="color-label">Available Colors:</p>

                <div className="color-options">

                  {imageColors.length > 0 && (
                    <button
                      className={`color-circle default ${selectedColor === null ? 'active' : ''}`}
                      onClick={() => setSelectedColor(null)}
                    >
                      ALL
                    </button>
                  )}

                  {displayColors.map(color => (
                    <button
                      key={color}
                      className={`color-circle ${selectedColor === color ? 'active' : ''}`}
                      style={{ backgroundColor: resolveSwatchColor(color) }}
                      onClick={() => imageColors.length > 0 && setSelectedColor(color)}
                      title={color}
                      aria-label={color}
                    />
                  ))}

                </div>
              </div>
            )
          })()}

          {isLoggedIn && (
            <p className="product-details-price">
              ₹ {product.price.toLocaleString('en-IN')}
            </p>
          )}


          {/* SPECS */}
          <div className="product-details-specs">
            <h3 className="product-details-specs-title">Product Details</h3>

            <dl className="product-details-spec-list">

              <div className="product-details-spec-row">
                <dt>Category</dt>
                <dd>{product.productCategory ?? '—'}</dd>
              </div>

              <div className="product-details-spec-row">
                <dt>Subcategory</dt>
                <dd>{product.productSubcategory ?? '—'}</dd>
              </div>

              <div className="product-details-spec-row">
                <dt>Material</dt>
                <dd>{product.material || '—'}</dd>
              </div>

              <div className="product-details-spec-row">
                <dt>Color</dt>
                <dd>
                  {(() => {
                    const imageColors = [...new Set(
                      (product.images || [])
                        .map(img => img.color)
                        .filter(Boolean)
                    )]
                    const colors = imageColors.length > 0
                      ? imageColors
                      : (product.color ? [product.color] : [])

                    if (colors.length === 0) return '—'

                    return (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {colors.map((c) => (
                          <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <span
                              aria-hidden
                              style={{
                                display: 'inline-block',
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                backgroundColor: resolveSwatchColor(c),
                                border: '1px solid #ccc',
                              }}
                            />
                            {c}
                          </span>
                        ))}
                      </span>
                    )
                  })()}
                </dd>
              </div>

              <div className="product-details-spec-row">
  <dt>Size (L×B×H)</dt>
  <dd>{product.dimensions || '—'}</dd>
</div>

<div className="product-details-spec-row">
  <dt>Seater</dt>
  <dd>{product.seater || '—'}</dd>
</div>

<div className="product-details-spec-row">
  <dt>Product Stock</dt>
  <dd>{product.productStock ?? '—'}</dd>
</div>

<div className="product-details-spec-row">
  <dt>Min Qty</dt>
  <dd>{product.minQty || '—'}</dd>
</div>

<div className="product-details-spec-row">
  <dt>Status</dt>
  <dd>{product.productStatus || '—'}</dd>
</div>

<div className="product-details-spec-row">
  <dt>Active</dt>
  <dd>{product.activeStatus ? 'Yes' : 'No'}</dd>
</div>

              <div className="product-details-spec-row">
                <dt>Created</dt>
                <dd>
                  {product.createdAt && !isNaN(new Date(product.createdAt))
                    ? new Date(product.createdAt).toLocaleDateString('en-IN')
                    : '—'}
                </dd>
              </div>

              <div className="product-details-spec-row">
                <dt>Updated</dt>
                <dd>
                  {product.updatedAt && !isNaN(new Date(product.updatedAt))
                    ? new Date(product.updatedAt).toLocaleDateString('en-IN')
                    : '—'}
                </dd>
              </div>

            </dl>
          </div>

          <div className="product-details-qty-wrap">
           <QuantitySelector
  qty={qty}
 onSetQty={(v) => {
  // always update local
  setSelectedQty(prev => ({
    ...prev,
    [product.id]: v
  }))

  // sync cart if already added
  if (inCartQty > 0) {
    setQty(product.id, v)
  }
}}
  max={product.availableQty > 0 ? product.availableQty : Number(product.productStock) || 0}
            />
          </div>

         <button
  className={`product-add-btn product-details-add${inCartQty > 0 ? ' product-add-btn--in-cart' : ''}`}
 onClick={() => {
  const finalQty = selectedQty[product.id] ?? 1

  if (!localStorage.getItem('token')) {
    try {
      const queue = JSON.parse(localStorage.getItem('rentangadi_pending_cart') || '[]')
      queue.push({ item: product, qty: finalQty })
      localStorage.setItem('rentangadi_pending_cart', JSON.stringify(queue))
    } catch (_) {}
    window.dispatchEvent(new Event('open-login'))
    return
  }

  if (inCartQty > 0) {
    setShowCartPage(true)
    return
  }

  addToCart(product, finalQty)
  setToastMessage('Added to cart')
}}
>
  {inCartQty > 0 ? 'Go to Cart' : 'Add to Cart'}
</button>

        </div>
      </div>
    </div>

    {toastMessage && (
        <div className="best-sellers-add-to-cart-toast" role="status" aria-live="polite">
          <span className="best-sellers-toast-icon">✓</span>
          {toastMessage}
        </div>
      )}
      </>
  )
}