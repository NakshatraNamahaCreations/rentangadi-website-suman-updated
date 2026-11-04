import { useCart } from '../hooks/useCart'
import './Footer.css'

function Footer() {
  const { navigateTo } = useCart()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              <img src="/logo.png" alt="Rent Angadi" className="footer-logo-img" />
            </a>
            <p className="footer-tagline">
              Wedding & Event Furniture Rentals. Rent elegance for your big day.
            </p>
          </div>

          <div className="footer-links">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-list">
              <li><a href="/" onClick={(e) => { e.preventDefault(); navigateTo('home') }}>Home</a></li>
              <li><a href="/products" onClick={(e) => { e.preventDefault(); navigateTo('products') }}>Products</a></li>
              <li><a href="/about" onClick={(e) => { e.preventDefault(); navigateTo('about') }}>About Us</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigateTo('contact') }}>Contact</a></li>
              <li><a href="/enquiries" onClick={(e) => { e.preventDefault(); navigateTo('orders') }}>My Enquiries</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="footer-list footer-contact-list">
              <li>
                <a href="tel:+919619886262">
                  <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  +91 96198 86262
                </a>
              </li>
              <li>
                <a href="mailto:info@rentangadi.com">
                  <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  rentangadi@gmail.com
                </a>
              </li>
              <li>
                <span>
                  <svg className="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Sy No 258/8, Old Sy No 258/1 Battahalasur Jala Hobli, Bettahalasur, Bangalore — Bengaluru Urban Karnataka - 560001
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Rent Angadi. All rights reserved.
          </p>
          <p className="footer-dev">
            Website developed by{' '}
            <a
              href="https://www.nakshatranamahacreations.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-dev-link"
            >
              Nakshatra Namaha Creations Pvt Ltd
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
