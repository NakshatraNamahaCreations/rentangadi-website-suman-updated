import { createContext, useContext, useCallback, useState, useEffect } from 'react'

const ProductDetailsContext = createContext(null)

/**
 * After closing product details, scroll this card into view on home or category grid.
 * Set when opening details; consumed after scroll runs.
 */
export function ProductDetailsProvider({ children }) {
  const [product, setProduct] = useState(null)
  const [detailReturnScroll, setDetailReturnScroll] = useState(null)

  const openProductDetails = useCallback((productData, options = {}) => {
    const source = options.source === 'category' ? 'category' : 'home'
    if (productData?.id != null) {
      setDetailReturnScroll({ productId: String(productData.id), source })
    }
    setProduct(productData)
  }, [])

  const closeProductDetails = useCallback(() => {
    setProduct(null)
  }, [])

  const consumeDetailReturnScroll = useCallback(() => {
    setDetailReturnScroll(null)
  }, [])

  // Clear product details when navigating via header/footer
  useEffect(() => {
    const onNav = () => setProduct(null)
    window.addEventListener('nav-change', onNav)
    return () => window.removeEventListener('nav-change', onNav)
  }, [])

  return (
    <ProductDetailsContext.Provider
      value={{
        product,
        openProductDetails,
        closeProductDetails,
        detailReturnScroll,
        consumeDetailReturnScroll,
      }}
    >
      {children}
    </ProductDetailsContext.Provider>
  )
}

export function useProductDetails() {
  const ctx = useContext(ProductDetailsContext)
  if (!ctx) throw new Error('useProductDetails must be used within ProductDetailsProvider')
  return ctx
}
