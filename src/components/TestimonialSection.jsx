import { useState, useEffect } from 'react'
import chairImg from '../assets/furniture1/img.png'
import './TestimonialSection.css'

const testimonials = [
  {
    quote: 'Rent Angadi is one of the best wedding furniture rental services that provide premium chairs, tables and décor for weddings and events. Their collection is elegant and delivery was flawless.',
    name: 'Priya & Raj',
    role: 'Bride & Groom',
  },
  {
    quote: 'We rented Chiavari chairs and beautiful floral arrangements for our garden wedding. Rent Angadi made our special day look absolutely stunning. Highly recommend!',
    name: 'Anita Sharma',
    role: 'Event Planner',
  },
  {
    quote: 'The quality of furniture and the professional service from Rent Angadi exceeded our expectations. Our reception looked like a dream come true.',
    name: 'Vikram Mehta',
    role: 'Wedding Organizer',
  },
]

function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [countdown, setCountdown] = useState({ days: 0, hours: 11, mins: 20, secs: 55 })

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)
    endDate.setHours(23, 59, 59, 999)

    const tick = () => {
      const now = new Date()
      const diff = Math.max(0, endDate - now)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const secs = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown({ days, hours, mins, secs })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="testimonial-section">
      <div className="testimonial-row">
        <div className="testimonial-deal-col">
          <div className="deal-wrap">
            <div className="deal-content">
              <span className="deal-discount">DISCOUNTED UP TO <strong>50%</strong></span>
              <h3 className="deal-product">Wedding Chair Collection</h3>
              <span className="deal-offer">LIMITED TIME OFFER</span>
              <div className="countdown-wrap">
                <div className="countdown item-4">
                  <div className="countdown__item">
                    <span className="countdown__time">{countdown.days}</span>
                    <span className="countdown__text">day</span>
                  </div>
                  <div className="countdown__item">
                    <span className="countdown__time">{countdown.hours}</span>
                    <span className="countdown__text">hrs</span>
                  </div>
                  <div className="countdown__item">
                    <span className="countdown__time">{countdown.mins}</span>
                    <span className="countdown__text">mins</span>
                  </div>
                  <div className="countdown__item">
                    <span className="countdown__time">{countdown.secs}</span>
                    <span className="countdown__text">secs</span>
                  </div>
                </div>
              </div>
              <div className="deal-btn-wrap">
                <a href="/shop" className="deal-btn">Discover Now!</a>
              </div>
            </div>
            <img src={chairImg} alt="Wedding chair with flowers" className="deal-image" />
          </div>
        </div>
        <div className="testimonial-slider-col">
          <div className="testimonial-slider-wrap">
            <div className="testimonial-slider">
              {testimonials.map((item, idx) => (
                <div
                  key={idx}
                  className={`testimonial-slide ${idx === activeIndex ? 'active' : ''}`}
                >
                  <div className="testimonial-item">
                    <div className="testimonial-content">
                      <p className="testimonial-desc">
                        {item.quote.includes('Rent Angadi')
                          ? item.quote.split(/(Rent Angadi)/g).map((part, i) =>
                              part === 'Rent Angadi' ? <strong key={i}>{part}</strong> : part
                            )
                          : item.quote}
                      </p>
                    </div>
                    <div className="testimonial-user">
                      <h3 className="testimonial-name">{item.name}</h3>
                      <span className="testimonial-role">{item.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialSection
