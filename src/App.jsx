import { CategoryProductsProvider, useCategoryProducts } from './context/CategoryProductsContext'
import { ProductDetailsProvider, useProductDetails } from './context/ProductDetailsContext'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import TestimonialSection from './components/TestimonialSection'
import CategorySection from './components/CategorySection'
import BestSellersSection from './components/BestSellersSection'
import FestivalOfferSection from './components/FestivalOfferSection'
import Footer from './components/Footer'
import CartPage from './components/CartPage'
import OrdersPage from './components/OrdersPage'
import ConfirmedOrdersPage from './components/ConfirmedOrdersPage'
import CategoryProductsPage from './components/CategoryProductsPage'
import ProductDetailsPage from './components/ProductDetailsPage'
import ProductsPage from './components/ProductsPage'
import AboutPage from './components/AboutPage'
import ContactPage from './components/ContactPage'
import WhatsAppFloat from './components/WhatsAppFloat'
import MobileTabBar from './components/MobileTabBar'
import { useEffect } from 'react'
import { useCart } from './hooks/useCart'
import { useUrlSync } from './navigation/urlSync'
import { getProducts } from './api/productApi'
import { getSubCategories } from './api/categoryApi'
import './App.css'
/* Last, so the phone-sized corrections win over the component sheets they
   correct without needing !important. */
import './mobile.css'

function AppContent() {
  const { showCartPage, showOrdersPage, showConfirmedOrdersPage, showProductsPage, showAboutPage, showContactPage, navigateTo, loadUserCart, clearOnLogout, addToCart } = useCart()
  const { view } = useCategoryProducts()
  const { product } = useProductDetails()

  /* Keeps the address bar and the back button in step with the page being
     shown; without it every page sat at "/" and back left the site. */
  useUrlSync()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [showCartPage, showOrdersPage, showConfirmedOrdersPage, showProductsPage, showAboutPage, showContactPage, view, product])

  // Preload caches on app start
  useEffect(() => {
    getProducts().catch(() => {})
    getSubCategories().catch(() => {})
  }, [])

  // Swap cart on login/logout
  useEffect(() => {
    const onAuthChange = () => {
      const token = localStorage.getItem('token')
      if (token) {
        loadUserCart()
        // Apply any "Add to Cart" attempts that happened before login
        try {
          const raw = localStorage.getItem('rentangadi_pending_cart')
          if (raw) {
            const queue = JSON.parse(raw)
            if (Array.isArray(queue)) {
              queue.forEach(({ item, qty }) => {
                if (item && item.id) addToCart(item, qty || 1)
              })
            }
            localStorage.removeItem('rentangadi_pending_cart')
          }
        } catch (_) {}
      } else {
        clearOnLogout()
      }
    }
    window.addEventListener('auth-change', onAuthChange)
    return () => window.removeEventListener('auth-change', onAuthChange)
  }, [loadUserCart, clearOnLogout, addToCart])
  if (showConfirmedOrdersPage) {
    return (
      <>
        <Header />
        <ConfirmedOrdersPage />
        <Footer />
      </>
    )
  }
  if (showOrdersPage) {
    return (
      <>
        <Header />
        <OrdersPage />
        <Footer />
      </>
    )
  }
  if (showCartPage) {
    return (
      <>
        <Header />
        <CartPage />
        <Footer />
      </>
    )
  }
  if (product) {
    return (
      <>
        <Header />
        <ProductDetailsPage />
        <Footer />
      </>
    )
  }
  if (view) {
    return (
      <>
        <Header />
        <CategoryProductsPage />
        <Footer />
      </>
    )
  }
  if (showProductsPage) {
    return (
      <>
        <Header />
        <ProductsPage />
        <Footer />
      </>
    )
  }
  if (showAboutPage) {
    return (
      <>
        <Header />
        <AboutPage />
        <Footer />
      </>
    )
  }
  if (showContactPage) {
    return (
      <>
        <Header />
        <ContactPage />
        <Footer />
      </>
    )
  }
  return (
    <>
      <Header />
      <HeroSection />
      <AboutSection navigateTo={navigateTo} />
      <ServicesSection />
      <CategorySection />
      {/* <TestimonialSection /> */}
      <BestSellersSection />
     
      
      
     
   

      
      <FestivalOfferSection />
      <Footer />
    </>
  )
}

function App() {
  return (
    <CategoryProductsProvider>
      <ProductDetailsProvider>
        <AppContent />
        <WhatsAppFloat />
        <MobileTabBar />
      </ProductDetailsProvider>
    </CategoryProductsProvider>
  )
}

export default App
