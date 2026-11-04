import { useState, useMemo } from 'react'
import { furnitureItems } from '../data/furnitureData'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import QuantitySelector from './QuantitySelector'
import './GallerySection.css'

export function ProductImageCarousel({ item, onImageClick }) {
  const [activeIdx, setActiveIdx] = useState(0)

  // ✅ NORMALIZE IMAGES (CRITICAL FIX)
  const images = (item.images && item.images.length > 0)
    ? item.images.map(img =>
        typeof img === 'object'
          ? img
          : { url: img, color: null }
      )
    : [{ url: item.src, color: null }]

  const hasMultiple = images.length > 1
  const hoverSrc = item.hoverImage

  const currentImg = images[activeIdx]?.url // ✅ FIXED

  const wrapClass = `product-card-image-wrap${hoverSrc ? ' product-card-image-wrap--hover-swap' : ''}`

  return (
    <>
      <div className={wrapClass}>
        
        {/* ✅ MAIN IMAGE */}
        <img
          src={currentImg}   // ✅ FIXED HERE
          alt={item.name}
          className="product-card-img"
        />

        {/* ✅ HOVER IMAGE */}
        {hoverSrc && (
          <img
            src={hoverSrc}
            alt=""
            className="product-card-img product-card-img-hover"
            aria-hidden
          />
        )}

        {/* OVERLAY */}
        <div className="product-card-hover-content">
          <button
            type="button"
            className="product-card-plus-btn"
            onClick={(e) => {
              e.stopPropagation()
              onImageClick({ ...item, _lightboxIdx: activeIdx })
            }}
          >
            +
          </button>
          <span className="product-card-hover-text">{item.name}</span>
        </div>
      </div>

      {/* DOTS */}
      {hasMultiple && (
        <div
          className="product-card-dots"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`product-card-dot ${idx === activeIdx ? 'active' : ''}`}
              onClick={() => setActiveIdx(idx)}
            />
          ))}
        </div>
      )}
    </>
  )
}

const TAB_ORDER = ['All', 'Chairs', 'Tables', 'Sofas', 'Decor']

function GallerySection() {
  const [activeTab, setActiveTab] = useState('All')
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxImgIdx, setLightboxImgIdx] = useState(0)
  const { addToCart, setQty, getCartQty } = useCart()
  const { isLoggedIn } = useAuth()

  const tabs = useMemo(() => {
    const categories = new Set(furnitureItems.map((item) => item.category).filter((c) => c !== 'All'))
    return [
      { key: 'All', label: 'All' },
      ...TAB_ORDER.filter((k) => k !== 'All' && categories.has(k)).map((key) => ({ key, label: key })),
    ]
  }, [])

  const filtered =
    activeTab === 'All'
      ? furnitureItems.filter((item) => item.category !== 'All')
      : furnitureItems.filter((item) => item.category === activeTab)

  return (
    <section className="gallery-section">
      <div className="gallery-container">
        <h2 className="gallery-title">Our Collection</h2>
        <div className="gallery-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`gallery-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="gallery-grid">
          {filtered.map((item) => {
            const inCartQty = getCartQty(item.id)
            return (
              <div key={item.id} className="product-card">
                <ProductImageCarousel
                  item={item}
                  onImageClick={(itemWithIdx) => {
                    setLightboxImage(itemWithIdx)
                    setLightboxImgIdx(itemWithIdx._lightboxIdx ?? 0)
                  }}
                />
                <h3 className="product-card-title">{item.name}</h3>
                <p className="product-card-dims">SIZE (LBH) - {item.dimensions}</p>
                <div className="product-card-footer">
                  {isLoggedIn && (
                    <span className="product-card-price">₹ {item.price.toLocaleString('en-IN')}</span>
                  )}
                  <QuantitySelector
                    qty={inCartQty || 1}
                    onSetQty={(v) => {
                      if (inCartQty > 0) setQty(item.id, v)
                    }}
                    max={item.availableQty > 0 ? item.availableQty : Number(item.productStock) || 0}
                  />
                  <button
                    type="button"
                    className="product-add-btn"
                    onClick={() => {
                      if (!localStorage.getItem('token')) { window.dispatchEvent(new Event('open-login')); return }
                      addToCart(item)
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {lightboxImage && (() => {
       const images = (lightboxImage.images || []).map(img =>
  typeof img === 'object'
    ? img
    : { url: img, color: null }
)

const currentImg = images[lightboxImgIdx]?.url || images[0]?.url
        const hasMultiple = images.length > 1
        return (
        <div
          className="gallery-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Product details"
        >
          <div className="gallery-lightbox-content gallery-lightbox-with-details" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gallery-lightbox-close"
              onClick={() => setLightboxImage(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="gallery-lightbox-body">
              <div className="gallery-lightbox-image-wrap">
                <img
                  src={currentImg}
                  alt={lightboxImage.name}
                  className="gallery-lightbox-img"
                />
                {hasMultiple && (
                  <div className="gallery-lightbox-dots" role="tablist">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        role="tab"
                        aria-selected={idx === lightboxImgIdx}
                        className={`gallery-lightbox-dot ${idx === lightboxImgIdx ? 'active' : ''}`}
                        onClick={() => setLightboxImgIdx(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="gallery-lightbox-info">
                <h3 className="gallery-lightbox-title">{lightboxImage.name}</h3>
                <p className="gallery-lightbox-description">{lightboxImage.description}</p>
                <p className="gallery-lightbox-dims">SIZE (LBH) - {lightboxImage.dimensions}</p>
                {isLoggedIn && (
                  <p className="gallery-lightbox-price">₹ {lightboxImage.price.toLocaleString('en-IN')}</p>
                )}
                <button
                  type="button"
                  className="product-add-btn gallery-lightbox-add"
                  onClick={() => {
                    addToCart(lightboxImage)
                    setLightboxImage(null)
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
        )
      })()}
    </section>
  )
}

export default GallerySection
