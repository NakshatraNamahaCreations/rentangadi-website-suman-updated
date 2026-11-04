import AboutSection from './AboutSection'
import ServicesSection from './ServicesSection'
import FestivalOfferSection from './FestivalOfferSection'
import { useCart } from '../hooks/useCart'
import './AboutPage.css'

function AboutPage() {
  const { navigateTo } = useCart()

  return (
    <div className="about-page">
      <div className="about-page-hero">
        <div className="about-page-hero-inner">
          <span className="about-page-label">Who We Are</span>
          <h1 className="about-page-title">About Us</h1>
          <p className="about-page-subtitle">
            Bangalore's trusted furniture rental partner
          </p>
        </div>
        <button
          type="button"
          className="about-page-back"
          onClick={() => navigateTo('home')}
          aria-label="Back to home"
        >
          ← Back to Home
        </button>
      </div>

      <AboutSection />
      <ServicesSection />
      <FestivalOfferSection />
    </div>
  )
}

export default AboutPage
