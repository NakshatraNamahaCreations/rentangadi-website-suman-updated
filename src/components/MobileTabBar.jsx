import { useCart } from '../hooks/useCart'
import { useCategoryProducts } from '../context/CategoryProductsContext'
import { useProductDetails } from '../context/ProductDetailsContext'
import { pageFromFlags } from '../navigation/urlSync'
import './MobileTabBar.css'

/**
 * The phone's main navigation, in the place a phone expects it: a fixed bar at
 * the bottom, within thumb reach, rather than behind a hamburger at the top.
 *
 * Only the four places a visitor actually moves between are here. About and
 * Contact stay in the menu, because they are read once and not navigated to
 * repeatedly. Hidden above 768px, where the header's own nav takes over.
 */

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
    <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
  </svg>
)

const IconList = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
    <path d="M8 6h12M8 12h12M8 18h12" strokeLinecap="round" />
    <circle cx="4" cy="6" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1.3" fill="currentColor" stroke="none" />
  </svg>
)

const IconCart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h3l2.3 11.2a1.7 1.7 0 0 0 1.7 1.3h8a1.7 1.7 0 0 0 1.7-1.3L21 7H6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function MobileTabBar() {
  const cartState = useCart()
  const { cartCount, navigateTo } = cartState
  const { view } = useCategoryProducts()
  const { product } = useProductDetails()

  /* A product or a category sits on top of the catalogue, so Products stays
     lit while the visitor is down inside it. */
  const page = view || product ? 'products' : pageFromFlags(cartState)

  const tabs = [
    { key: 'home', label: 'Home', Icon: IconHome },
    { key: 'products', label: 'Products', Icon: IconGrid },
    { key: 'orders', label: 'Enquiries', Icon: IconList },
    { key: 'cart', label: 'Cart', Icon: IconCart, badge: cartCount },
  ]

  return (
    <nav className="tabbar" aria-label="Main">
      {tabs.map(({ key, label, Icon, badge }) => {
        const active = page === key
        return (
          <button
            key={key}
            type="button"
            className={`tabbar__item${active ? ' is-active' : ''}`}
            onClick={() => navigateTo(key)}
            aria-current={active ? 'page' : undefined}
            aria-label={badge > 0 ? `${label}, ${badge} in cart` : label}
          >
            <span className="tabbar__icon">
              <Icon />
              {badge > 0 ? (
                <span className="tabbar__badge">{badge > 99 ? '99+' : badge}</span>
              ) : null}
            </span>
            <span className="tabbar__label">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
