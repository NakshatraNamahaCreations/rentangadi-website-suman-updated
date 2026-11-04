import CategorySection from './CategorySection'
import BestSellersSection from './BestSellersSection'
import { useCart } from '../hooks/useCart'

import './ProductsPage.css'

function ProductsPage() {
  const { navigateTo } = useCart()

  return (
    <div className="products-page">
      <div className="products-page-hero">
        <div className="products-page-hero-inner">
          <span className="products-page-label">Explore</span>
          <h1 className="products-page-title">Our Products</h1>
          <p className="products-page-subtitle">
            Premium furniture rental for every occasion
          </p>
        </div>
        <button
          type="button"
          className="products-page-back"
          onClick={() => navigateTo('home')}
          aria-label="Back to home"
        >
          ← Back to Home
        </button>
      </div>

      <CategorySection />
      <BestSellersSection />
    </div>
  )
}

export default ProductsPage
