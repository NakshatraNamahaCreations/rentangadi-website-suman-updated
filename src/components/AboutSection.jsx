import { useEffect, useRef, useState } from 'react'
import venueImg from '../assets/images/12.jpeg'
import topImg from '../assets/images/10.jpg'
import flowerImg from '../assets/furniture1/img2.png'
import './AboutSection.css'

function AboutSection({ navigateTo }) {
  const wrapRef = useRef(null)
  const [parallaxY, setParallaxY] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      const viewportCenter = window.innerHeight / 2
      const offset = (centerY - viewportCenter) * 0.25
      setParallaxY(offset)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-wrapper">
          <div className="about-image-col">
            <div className="about-image-main-wrap" ref={wrapRef}>
              <img
                src={venueImg}
                alt="Wedding venue with intricate decor"
                className="about-image-main"
                style={{
                  transform: `translate3d(0px, ${parallaxY}px, 0px)`,
                }}
              />
            </div>
            {/* <div className="about-card">
              <div className="about-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="about-card-content">
                <span className="about-card-number">50+</span>
                <p className="about-card-label">Wedding Rentals</p>
              </div>
            </div> */}
            <div className="about-image-overlay">
              <img
                src={topImg}
                alt="Wedding celebration table with chiavari seats outdoors"
                width={312}
                height={230}
              />
            </div>
          </div>
          <div className="about-text-col">
            <div className="about-flower-decor">
              <img src={flowerImg} alt="" aria-hidden />
            </div>
            <div className="about-text-content">
            <span className="about-label">About Us</span>
            <h2 className="about-title">Welcome To Rent Angadi</h2>
            <div className="about-body">
              <p className="about-desc">
                To be South India's most distinctive, design-forward rental studio, where every piece has provenance and personality.                       
                To provide accessible, high-quality furniture and prop rentals that celebrate craftsmanship, narrative, and aesthetic individuality.            
                To elevate spaces through curated, story-rich rentals that blend heritage, design, and modern expression.
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
