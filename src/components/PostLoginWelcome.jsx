import './PostLoginWelcome.css'

/** Same asset as Header; served from /public/logo.png */
const LOGO_URL = '/logo.png'

function getWelcomeName() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    return u.name || u.executiveName || u.phoneNumber || ''
  } catch {
    return ''
  }
}

export default function PostLoginWelcome({ onContinue, onBack }) {
  const name = getWelcomeName()

  return (
    <div className="post-login-welcome">
      <div className="post-login-welcome-card">
        <div className="post-login-welcome-logo-crop">
          <img
            src={LOGO_URL}
            alt=""
            className="post-login-welcome-logo"
            decoding="async"
          />
        </div>
        <h2 className="post-login-welcome-title">
          {name ? `Welcome, ${name}` : 'Welcome'}
        </h2>
        <p className="post-login-welcome-text">
          You&apos;re signed in. Continue to complete your enquiry and place your order.
        </p>
        <div className="post-login-welcome-actions">
          <button
            type="button"
            className="post-login-welcome-btn post-login-welcome-btn-primary"
            onClick={onContinue}
          >
            Continue to checkout
          </button>
          <button
            type="button"
            className="post-login-welcome-btn post-login-welcome-btn-secondary"
            onClick={onBack}
          >
            Back to cart
          </button>
        </div>
      </div>
    </div>
  )
}
