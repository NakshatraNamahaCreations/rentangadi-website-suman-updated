import { useState, useEffect, useRef, useMemo } from 'react'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { useProductDetails } from '../context/ProductDetailsContext'
import { getProducts, mapProductFromApi } from '../api/productApi'
import heroImg from '../assets/furniture1/img_banner.jfif'
import './HeroSection.css'

function HeroSection() {
  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const { setProductSearch } = useCart()
  const { isLoggedIn } = useAuth()
  const { openProductDetails } = useProductDetails()
  const wrapRef = useRef(null)

  useEffect(() => {
    getProducts().then((raw) => {
      const mapped = raw
        .filter((item) => item?.ProductIcon)
        .map(mapProductFromApi)
        .filter(Boolean)
      setAllProducts(mapped)
    }).catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const suggestions = useMemo(() => {
  const q = query.trim().toLowerCase()
  if (!q || q.length < 2) return []

  const normalize = (str) =>
    (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const normalizedQuery = normalize(q)
  const queryWords = [...new Set(normalizedQuery.split(' '))].filter(Boolean)
  if (!queryWords.length) return []

  // If the query exactly matches a product name, return only that product
  const exact = allProducts.filter(
    (p) => normalize(p.name) === normalizedQuery
  )
  if (exact.length > 0) return exact

  // Otherwise, every query word must appear in the product name, description, subcategory, or category
  return allProducts.filter((p) => {
    const text = normalize(
      `${p.name || ''} ${p.description || ''} ${p.productSubcategory || ''} ${p.productCategory || ''}`
    )
    return queryWords.every((w) => text.includes(w))
  })
}, [query, allProducts])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setShowDropdown(val.trim().length >= 2)
    if (!val.trim()) setProductSearch('')
  }

  const handleSelectProduct = (product) => {
    setQuery('')
    setShowDropdown(false)
    setProductSearch('')
    openProductDetails(product, { source: 'home' })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setShowDropdown(false)
    setProductSearch(query.trim())
    setTimeout(() => {
      const el = document.getElementById('best-sellers-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleClear = () => {
    setQuery('')
    setProductSearch('')
    setShowDropdown(false)
  }

  return (
    <section className="hero">
    <div className='hero-image-wrapper'>
      <img src={heroImg} alt="Wedding furniture rentals" className="hero-image-only" />
      </div>
      <h2 className="hero-title">Rent Elegance for Your Big Day</h2>

      <div className="hero-search-wrap" ref={wrapRef}>
        <form className="hero-search-form" onSubmit={handleSearch} role="search">
          <svg className="hero-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className="hero-search-input"
            placeholder="Search sofas, chairs, tables…"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            aria-label="Search products"
          />
          {query && (
            <button type="button" className="hero-search-clear" onClick={handleClear}>✕</button>
          )}
          <button type="submit" className="hero-search-btn">Search</button>

          {showDropdown && suggestions.length > 0 && (
            <div className="hero-search-dropdown">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="hero-search-item"
                  onClick={() => handleSelectProduct(p)}
                >
                  <img
                    className="hero-search-item-img"
                    src={p.src}
                    alt={p.name}
                    loading="lazy"
                  />
                  <div className="hero-search-item-info">
                    <span className="hero-search-item-name">{p.name}</span>
                    {isLoggedIn && (
                      <span className="hero-search-item-price">₹ {p.price.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {showDropdown && query.trim().length >= 2 && suggestions.length === 0 && (
            <div className="hero-search-dropdown">
              <div className="hero-search-no-results">No products found</div>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

export default HeroSection
