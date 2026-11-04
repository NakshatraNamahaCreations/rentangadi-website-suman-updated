import sofaImg from '../assets/images/11.jpg'
import chairImg from '../assets/images/8.jpg'
import bg3Img from '../assets/images/bg_wallpaper.avif'
import './ServicesSection.css'

const services = [
  {
    subtitle: 'Weddings & celebrations',
    title: 'Lounges, stages & bridal corners',
    description:
      'Welcome your guests with lounges, stage seating, and intimate bridal corners that feel considered—not generic. Rent Angadi supplies sofas, tables, and accents chosen for presence and polish, so your reception and main hall read elegant, cohesive, and true to your day.',
    image: sofaImg,
    imageAlt: 'Wedding lounge and reception furniture for rent',
  },
  {
    subtitle: 'Seating & event décor',
    title: 'Chairs, tables & statement pieces',
    description:
      'Chiavari chairs, wood seating, and décor with real craft behind them. We dress mandaps, halls, and outdoor venues across South India with rentals that balance heritage warmth and modern style—high-quality, accessible, and built for the moments that matter.',
    image: chairImg,
    imageAlt: 'Chiavari chairs and event seating rentals',
  },
]

function ServicesSection() {
  return (
    <section
      className="services-section"
      style={{
        backgroundImage: ` url(${bg3Img})`,
      }}
    >
      <div className="services-container">
        <div className="services-header">
          <span className="services-subtitle">What we offer</span>
          <h2 className="services-title">Our services</h2>
        </div>

        <div className="services-list">
          {services.map((item, idx) => (
            <div
              key={idx}
              className={`services-item ${idx % 2 === 1 ? 'services-item-reverse' : ''}`}
            >
              <div className="services-thumb">
                <div className="services-thumb-wrap">
                  <img
                    src={item.image}
                    alt={item.imageAlt}
                    className="services-img"
                  />
                </div>
              </div>
              <div className="services-content">
                <span className="services-content-subtitle">{item.subtitle}</span>
                <h3 className="services-content-title">{item.title}</h3>
                <p className="services-content-desc">{item.description}</p>
             
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
