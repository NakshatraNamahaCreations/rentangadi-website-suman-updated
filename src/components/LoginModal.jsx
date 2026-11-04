import { useState, useEffect, useRef } from 'react'
import { loginUser } from '../api/authApi'
import './LoginModal.css'

export default function LoginModal({ onClose }) {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(digits)
    if (error) setError('')
  }

  const validatePhone = (value) => {
    if (value.length !== 10) return 'Mobile number must be 10 digits.'
    if (!/^[6-9]/.test(value)) return 'Mobile number must start with 6, 7, 8, or 9.'
    return ''
  }

  const handlePhoneBlur = () => {
    if (!phone) return
    const phoneError = validatePhone(phone)
    setError(phoneError)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!phone.trim()) {
      setError('Please enter your phone number.')
      return
    }
    const phoneError = validatePhone(phone)
    if (phoneError) {
      setError(phoneError)
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    try {
      await loginUser(phone, password)
      onClose()
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="login-modal-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Login"
    >
      <div className="login-modal">
        <button type="button" className="login-modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="login-modal-header">
          <div className="login-modal-logo">
            <div className="login-modal-logo-badge">
              <img src="/logo.png" alt="Rent Angadi" />
            </div>
          </div>
          <h2 className="login-modal-title">Welcome Back</h2>
          <p className="login-modal-subtitle">Sign in to explore our collection</p>
        </div>

        <div className="login-modal-body">
          <form className="login-modal-form" onSubmit={handleSubmit} noValidate>
            <div className="login-modal-field">
              <label htmlFor="lm-phone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                Phone Number
              </label>
              <input
                id="lm-phone"
                type="tel"
                inputMode="numeric"
                placeholder="+91 XXX XXX XXX"
                value={phone}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                required
                autoComplete="tel"
                autoFocus
                maxLength={10}
                pattern="^[6-9]\d{9}$"
              />
            </div>

            <div className="login-modal-field">
              <label htmlFor="lm-password">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Password
              </label>
              <div className="login-modal-password-wrap">
                <input
                  id="lm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-modal-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="login-modal-error">{error}</p>}

            <button type="submit" className="login-modal-submit" disabled={loading}>
              {loading && <span className="login-modal-spinner" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-modal-divider">
            <span>Need an account?</span>
          </div>

          <div className="login-modal-contact">
            <p className="login-modal-contact-title">Contact Rent Angadi</p>
            <div className="login-modal-contact-options">
              <a href="tel:+919619886262" className="login-modal-contact-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                096198 86262
              </a>
              <a
                href="https://wa.me/919619886262?text=Hi%2C%20I%20would%20like%20to%20register%20with%20Rent%20Angadi."
                target="_blank"
                rel="noopener noreferrer"
                className="login-modal-contact-link login-modal-whatsapp-link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
