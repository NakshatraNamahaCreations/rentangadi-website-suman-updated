import { createContext, useContext, useState, useEffect, useRef } from 'react'

const CategoryProductsContext = createContext(null)

export function CategoryProductsProvider({ children }) {
  const [view, setView] = useState(null)
  // Remember which subcategory card the user clicked, so Back can scroll to it
  // on the Products page after navigation.
  const returnTargetRef = useRef(null)

  const openProductsPage = (categoryId, categoryName, subKey, subLabel) => {
    returnTargetRef.current = subKey || null
    setView({ categoryId, categoryName, subKey, subLabel })
  }

  const closeProductsPage = () => {
    setView(null)
  }

  const getReturnTarget = () => returnTargetRef.current
  const clearReturnTarget = () => { returnTargetRef.current = null }

  // Clear view when navigating via header/footer
  useEffect(() => {
    const onNav = () => setView(null)
    window.addEventListener('nav-change', onNav)
    return () => window.removeEventListener('nav-change', onNav)
  }, [])

  return (
    <CategoryProductsContext.Provider
      value={{
        view,
        openProductsPage,
        closeProductsPage,
        getReturnTarget,
        clearReturnTarget,
      }}
    >
      {children}
    </CategoryProductsContext.Provider>
  )
}

export function useCategoryProducts() {
  const ctx = useContext(CategoryProductsContext)
  if (!ctx) throw new Error('useCategoryProducts must be used within CategoryProductsProvider')
  return ctx
}
