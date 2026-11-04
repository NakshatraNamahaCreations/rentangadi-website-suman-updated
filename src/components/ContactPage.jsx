import { useCart } from '../hooks/useCart'
import './ContactPage.css'

function ContactPage() {
  const { navigateTo } = useCart()

  return (
    <div className="contact-page">

      {/* Hero */}
      <div className="contact-page-hero">
        <div className="contact-page-hero-inner">
          <span className="contact-page-label">Get In Touch</span>
          <h1 className="contact-page-title">Contact Us</h1>
          <p className="contact-page-subtitle">We'd love to hear from you</p>
        </div>
        <button
          type="button"
          className="contact-page-back"
          onClick={() => navigateTo('home')}
          aria-label="Back to home"
        >
          ← Back to Home
        </button>
      </div>

      {/* Main content */}
      <div className="contact-body">
        <div className="contact-body-inner">
          <h2 className="contact-info-heading">Reach Us</h2>

          <div className="contact-cards-row">
            <div className="contact-card">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <p className="contact-card-label">Phone</p>
                <a href="tel:+919619886262" className="contact-card-value">+91 96198 86262</a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="contact-card-label">Email</p>
                <a href="mailto:rentangadi@gmail.com" className="contact-card-value">rentangadi@gmail.com</a>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="contact-card-label">Address</p>
                <p className="contact-card-value">
                  Sy No 258/8, Old Sy No 258/1,<br />
                  Battahalasur Jala Hobli, Bettahalasur,<br />
                  Bangalore, Karnataka — 560001
                </p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="contact-card-label">Business Hours</p>
                <p className="contact-card-value">
                  Mon – Sat: 10:30 AM – 7:00 PM<br />
                  Sunday: Limited Access
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map embed */}
      <div className="contact-map">
        <iframe
          title="Rent Angadi Warehouse"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227732.54767407547!2d77.40992791385469!3d13.014857080880562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1f0054301be7%3A0x4ebc0a72f56bdc85!2sRent%20Angadi%20Warehouse!5e1!3m2!1sen!2sin!4v1777023242506!5m2!1sen!2sin"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

    </div>
  )
}

export default ContactPage
