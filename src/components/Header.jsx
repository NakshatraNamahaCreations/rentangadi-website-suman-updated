import { useState, useEffect } from 'react'
import { useCart } from '../hooks/useCart'
import {
  countOpenEnquiriesForUser,
  countConfirmedEnquiriesForUser,
} from '../utils/enquiryOrders'
import LoginModal from './LoginModal'
import './Header.css'

function getAuthState() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return {
      isLoggedIn: !!user,
      userName: user?.name || user?.executiveName || user?.phoneNumber || '',
      userId: user?._id || '',
    }
  } catch {
    return { isLoggedIn: false, userName: '', userId: '' }
  }
}

function Header() {
  const { cartCount, navigateTo, clearOnLogout, placedOrders, showProductsPage, showAboutPage, showContactPage, showOrdersPage, showCartPage, showConfirmedOrdersPage } = useCart()

  const [auth, setAuth] = useState(getAuthState)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Open login modal from anywhere via custom event
  useEffect(() => {
    const openLogin = () => setShowLoginModal(true)
    window.addEventListener('open-login', openLogin)
    return () => window.removeEventListener('open-login', openLogin)
  }, [])

  // Re-read auth state whenever login/logout happens
  useEffect(() => {
    const sync = () => setAuth(getAuthState())
    window.addEventListener('auth-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('auth-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const isHome = !showProductsPage && !showAboutPage && !showContactPage && !showOrdersPage && !showCartPage && !showConfirmedOrdersPage

  const openEnquiriesCount = countOpenEnquiriesForUser(placedOrders, auth.userId)
  const confirmedCount = countConfirmedEnquiriesForUser(placedOrders, auth.userId)

  const handleLogout = () => {
    clearOnLogout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rentangadi_placed_orders')
    window.dispatchEvent(new Event('auth-change'))
    navigateTo('home')
  }

  return (
    <>
      <header className="main-header">

        {/* Top info bar */}
        <div className="header-top-bar">
          <div className="header-container">
            <div className="top-bar-content">
              <div className="top-bar-left">
                <a href="tel:+919619886262" className="top-bar-link">
                  <svg className="top-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  096198 86262
                </a>
              </div>
              <div className="top-bar-right">
                <span className="top-bar-link">
                  <svg className="top-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Sy No 258/8, Battahalasur, Bangalore — Karnataka 560001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className="main-nav-bar">
          <div className="header-container">
            <div className="nav-wrapper">

              {/* Left: nav links */}
              <nav className="nav-links">
                <a href="/" className={`nav-link${isHome ? ' nav-active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('home') }}>Home</a>
                <a href="/products" className={`nav-link${showProductsPage ? ' nav-active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('products') }}>Products</a>
                <a href="/about" className={`nav-link${showAboutPage ? ' nav-active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('about') }}>About Us</a>
                <a href="/contact" className={`nav-link${showContactPage ? ' nav-active' : ''}`} onClick={(e) => { e.preventDefault(); navigateTo('contact') }}>Contact</a>
                <a
                  href="/enquiries"
                  className={`nav-link${showOrdersPage ? ' nav-active' : ''}`}
                  onClick={(e) => { e.preventDefault(); navigateTo('orders') }}
                  aria-label={`My Enquiries${openEnquiriesCount > 0 ? ` (${openEnquiriesCount})` : ''}`}
                >
                  My Enquiries
                  {/* {openEnquiriesCount > 0 && (
                    <span className="nav-badge">{openEnquiriesCount}</span>
                  )} */}
                </a>
              </nav>

              <button
  className="hamburger-btn"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={isMobileMenuOpen}
>
  <span></span>
  <span></span>
  <span></span>
</button>

{isMobileMenuOpen && (
  <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
)}

<div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
  
  {/* CLOSE BUTTON */}
  <button
    className="mobile-close-btn"
    onClick={() => setIsMobileMenuOpen(false)}
  >
    ✕
  </button>

  <a onClick={() => { navigateTo('home'); setIsMobileMenuOpen(false) }}>Home</a>
  <a onClick={() => { navigateTo('products'); setIsMobileMenuOpen(false) }}>Products</a>
  <a onClick={() => { navigateTo('about'); setIsMobileMenuOpen(false) }}>About Us</a>
  <a onClick={() => { navigateTo('contact'); setIsMobileMenuOpen(false) }}>Contact</a>

  <a onClick={() => { navigateTo('orders'); setIsMobileMenuOpen(false) }}>
    My Enquiries {openEnquiriesCount > 0 && `(${openEnquiriesCount})`}
  </a>

  {/* <a onClick={() => { navigateTo('confirmed'); setIsMobileMenuOpen(false) }}>
    Confirmed {confirmedCount > 0 && `(${confirmedCount})`}
  </a> */}
</div>

              {/* Center: logo */}
              <div className="nav-logo">
                <a href="/" onClick={() => navigateTo('home')}>
                  <img src="/logo.png" alt="Rent Angadi" className="logo-img" />
                </a>
              </div>

              {/* Right: actions */}
              <div className="nav-actions">

                {/* Confirmed orders */}
                {/* <button
                  type="button"
                  className="nav-btn"
                  onClick={() => navigateTo('confirmed')}
                  aria-label={`Confirmed orders${confirmedCount > 0 ? ` (${confirmedCount})` : ''}`}
                >
                  <svg className="nav-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                    <span className="btn-label">Confirmed</span>
                    {confirmedCount > 0 && (
                    <span className="nav-badge">{confirmedCount}</span>
                  )}
                </button> */}

                <a href="https://res.cloudinary.com/duetf78gt/image/upload/v1790593847/1.pdf" target="_blank" rel="noopener noreferrer" className="nav-btn" aria-label="Download Catalog">
  <svg className="nav-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
  <span className="btn-label">Catalog</span>
</a>

                {/* Cart */}
                <button
                  type="button"
                  className="nav-btn nav-btn-cart"
                  onClick={() => navigateTo('cart')}
                  aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
                >
                  <svg className="nav-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span className="btn-label">Cart</span>
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </button>

                {/* User / Login */}
                {auth.isLoggedIn ? (
                  <div className="nav-user">
                    <div className="nav-user-chip">
                      <span className="nav-user-avatar">
                        {(auth.userName || '?')[0].toUpperCase()}
                      </span>
                      <span className="nav-user-name">{auth.userName}</span>
                    </div>
                    <button
                      type="button"
                      className="nav-logout-btn"
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="nav-btn nav-btn-ghost"
                    onClick={() => setShowLoginModal(true)}
                  >
                    <svg className="nav-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="btn-label">Login</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>


      </header>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  )
}

export default Header
