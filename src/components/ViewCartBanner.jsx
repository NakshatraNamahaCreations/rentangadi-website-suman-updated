import { useCart } from '../hooks/useCart'
import './ViewCartBanner.css'

export default function ViewCartBanner() {
  const { cartCount, cartTotal, setShowCartPage } = useCart()

  if (cartCount === 0) return null

  return (
    <button
      type="button"
      className="view-cart-banner"
      onClick={() => setShowCartPage(true)}
    >
      <span>{cartCount} ITEM{cartCount !== 1 ? 'S' : ''}</span>
      <span>₹ {cartTotal.toLocaleString('en-IN')}</span>
      <span>VIEW CART</span>
    </button>
  )
}
