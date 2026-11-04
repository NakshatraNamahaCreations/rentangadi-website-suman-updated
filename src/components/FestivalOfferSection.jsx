import archImg from '../assets/images/10.jpg'
import { useCart } from '../hooks/useCart'
import './FestivalOfferSection.css'

function FestivalOfferSection() {
  const { navigateTo } = useCart()

  return (
    <section className="festival-offer-section">
      <div className="festival-offer-wrapper">
        <div className="festival-offer-row">
          <div className="festival-offer-col festival-offer-col-image">
            <div className="festival-image">
              <img src={archImg} alt="Wedding ceremonial arch with floral decoration" />
            </div>
          </div>
          <div className="festival-offer-col festival-offer-col-content">
            <div className="festival-content">
              <h6 className="festival-subtitle">Curated Collections</h6>
              <h2 className="festival-title">Crafted for Celebrations <br /> Styled with Soul</h2>
              <p className="festival-desc">
                Every occasion deserves a setting that tells its own story. At Rent Angadi, we bring together heritage-inspired furniture, handpicked props, and design-forward pieces to transform your venue into something extraordinary. From intimate gatherings to grand celebrations, our curated rentals blend craftsmanship with modern elegance.
              </p>
              <div className="festival-offer-box">
                <h3>500+ <br /> Pieces</h3>
              </div>
              <h3 className="festival-product">Premium Rental Collection</h3>
              <p className="festival-tagline">Heritage Meets Modern Design</p>
              <a href="/products" className="festival-btn" onClick={(e) => { e.preventDefault(); navigateTo('products') }}>Explore Collection →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FestivalOfferSection
