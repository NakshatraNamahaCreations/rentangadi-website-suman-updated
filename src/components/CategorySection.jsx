  import { useEffect, useState, useMemo } from 'react'
  import { getSubCategories } from '../api/categoryApi'
 import { resolveProductImage, resolveSubcategoryImage } from "../api/config"
  import { groupSubcategoriesByCategory, getCategoriesWithSubs } from "../utils/categoryUtils"
  import { useCategoryProducts } from "../context/CategoryProductsContext"
  import { useCart } from "../hooks/useCart"
  import "./CategorySection.css"
  import { getProducts } from "../api/productApi";
  import { useProductDetails } from "../context/ProductDetailsContext";


  function CategorySection() {
    const { openProductsPage } = useCategoryProducts()
    const { productSearch, setProductSearch } = useCart()
    const [products, setProducts] = useState([]);
    const [categoriesWithSubs, setCategoriesWithSubs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
const { openProductDetails } = useProductDetails();
    const filteredProducts = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();

  if (!q) return [];

  return products.filter((p) => {
  const normalize = (str) =>
    str.toLowerCase().replace(/[^a-z0-9\s]/g, '');

  const text = normalize(`
    ${p.name || ""}
    ${p.productSubcategory || ""}
    ${p.productCategory || ""}
    ${p.description || ""}
    ${p.material || ""}
    ${p.color || ""}
    ${p.seater || ""}
    ${p.dimensions || ""}
  `);

  const words = normalize(q).split(/\s+/).filter(Boolean);

  if (words.length === 0) return false;

  // ✅ ALL WORDS MUST MATCH
  return words.every(word => text.includes(word));
});
}, [products, searchQuery]);

  const filteredCategories = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();

  if (!q) return categoriesWithSubs;

  return categoriesWithSubs
    .map(({ category, subcategories }) => {

      const filteredSubs = subcategories.filter((sub) => {
        const subName = (sub.subcategory || "").toLowerCase();

        // ✅ Match subcategory
        const subMatch = subName.includes(q);

        // ✅ Match product names, descriptions, or attributes inside this subcategory
        const productMatch = products.some((p) => {
          if ((p.ProductSubcategory || "").toLowerCase() !== subName) return false
          const hay = `${p.name || ""} ${p.description || ""} ${p.material || ""} ${p.color || ""} ${p.seater || ""} ${p.dimensions || ""}`.toLowerCase()
          return hay.includes(q)
        });

        return subMatch || productMatch;
      });

      if (filteredSubs.length > 0) {
        return {
          category,
          subcategories: filteredSubs,
        };
      }

      // category match fallback
      if (category.toLowerCase().includes(q)) {
        return {
          category,
          subcategories,
        };
      }

      return null;
    })
    .filter(Boolean);

}, [categoriesWithSubs, searchQuery, products]);


    useEffect(() => {
      let cancelled = false

      async function fetchData() {
        try {
          setLoading(true)
          setError(null)

          const prodData = await getProducts();
const mapped = prodData.map((item) => {
  const imgUrl = resolveProductImage(item.ProductIcon)

  const backendImages =
    Array.isArray(item.images) && item.images.length > 0
      ? item.images.map((img) => ({
          url: typeof img === "object" ? img.url : img,
          color: img?.color || null,
        }))
      : null

  const mainColor = item.Color || null
  const images = backendImages
    ? [
        { url: imgUrl, color: mainColor },
        ...backendImages.filter((img) => img.url !== imgUrl),
      ]
    : [{ url: imgUrl, color: mainColor }]

  return {
    id: item._id,
    name: item.ProductName || "",
    description: item.ProductDesc || "",
    price: Number(item.ProductPrice) || 0,
    availableQty:
      Number(item.qty ?? item.StockAvailable ?? item.ProductStock) || 0,
    src: imgUrl,
    images,
    rawImages: item.images || [],
    productSubcategory: item.ProductSubcategory || "",
    productCategory: item.ProductCategory || "",
    color: item.Color || "",
    material: item.Material || "",
    seater: item.seater || "",
    createdAt: item.createdAt,
  }
})

setProducts(mapped)

          const data = await getSubCategories()

          if (cancelled) return

          const grouped = groupSubcategoriesByCategory(data)
          const arr = getCategoriesWithSubs(grouped)

          setCategoriesWithSubs(arr)
        } catch (err) {
          if (!cancelled) {
            setError(err.message)
            setCategoriesWithSubs([])
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
      }

      fetchData()

      return () => {
        cancelled = true
      }
    }, [])

    const getImageUrl = (subcatimg) => resolveSubcategoryImage(subcatimg) || null

    if (loading) {
      return (
        <section className="category-section">
          <div className="category-container">
            <span className="category-label">Browse by</span>
            <h2 className="category-title">Categories</h2>
            <div className="category-loading">Loading categories…</div>
          </div>
        </section>
      )
    }

    if (error) {
      return (
        <section className="category-section">
          <div className="category-container">
            <span className="category-label">Browse by</span>
            <h2 className="category-title">Categories</h2>
            <div className="category-error">
              Unable to load categories. Please try again later.
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="category-section" id="category-section">
        <div className="category-container">

          <span className="category-label">Browse by</span>
          <h2 className="category-title">Categories</h2>

          <div className="category-search-wrap">
            <svg className="category-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className="category-search-input"
              placeholder="Search categories…"
              value={searchQuery}
            onChange={(e) => {
      setSearchQuery(e.target.value)
      // setProductSearch(e.target.value) // 🔥 ADD THIS
    }}
              aria-label="Search categories"
            />
            {searchQuery && (
              <button type="button" className="category-search-clear" onClick={() => {
  setSearchQuery('')
  setProductSearch('')   // 🔥 THIS WAS MISSING
}} aria-label="Clear">✕</button>
            )}
          </div>

          {filteredCategories.length === 0 && filteredProducts.length === 0 && searchQuery && (
  <p className="category-no-results">
    No results found for "<strong>{searchQuery}</strong>"
  </p>
)}

         {filteredProducts.length > 0 && searchQuery ? (
  <div className="category-grid">
    {filteredProducts.map((p) => {
     const imgUrl = p.src

      return (
        <div
  key={p.id}
  className="category-card"
  onClick={() => {
  setSearchQuery('')
  setProductSearch('')
  openProductDetails(p, { source: 'search' })
  }}
  role="button"
  tabIndex={0}
 onKeyDown={(e) =>
  (e.key === "Enter" || e.key === " ") &&
  openProductDetails(p, { source: 'search' })
}
  style={{ cursor: "pointer" }}
>
          <div className="category-card-img-wrap">
            <img src={imgUrl} alt={p.name} className="category-card-img" />
          </div>

          <span className="category-card-name">
            {p.name}
          </span>

          {/* <p style={{ fontSize: "12px", color: "#777" }}>
            {p.productSubcategory}
          </p> */}
        </div>
      );
    })}
  </div>
) : (
  filteredCategories.map(({ category, subcategories }) => (
    <div key={category} className="category-group">

      <h3 className="category-group-title">{category}</h3>

      <div className="category-grid">
        {subcategories.map((item) => {

          const imgUrl = getImageUrl(item.subcatimg)

          const subKey = (item.subcategory || "")
            .toLowerCase()
            .replace(/\s+/g, "-")

          return (
            <button
              key={item._id}
              id={`category-card-${subKey}`}
              type="button"
              className="category-card"
              onClick={() =>
                openProductsPage(
                  category,
                  category,
                  subKey,
                  item.subcategory
                )
              }
            >
              <div className="category-card-img-wrap">
                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt=""
                    loading="lazy"
                    className="category-card-img"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.style.display = 'none'
                      const wrap = e.target.closest('.category-card-img-wrap')
                      const ph = wrap?.querySelector('.category-card-placeholder')
                      if (ph) ph.classList.remove('category-card-placeholder-hidden')
                    }}
                  />
                )}
                <div
                  className={`category-card-placeholder ${imgUrl ? 'category-card-placeholder-hidden' : ''}`}
                  aria-hidden
                >
                  <svg className="category-placeholder-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="6" y="30" width="52" height="18" rx="3" />
                    <rect x="10" y="22" width="44" height="8" rx="2" />
                    <line x1="14" y1="48" x2="14" y2="58" />
                    <line x1="50" y1="48" x2="50" y2="58" />
                    <rect x="18" y="10" width="28" height="12" rx="2" />
                  </svg>
                </div>
              </div>

              <span className="category-card-name">
                {item.subcategory}
              </span>

            </button>
          )
        })}
      </div>

    </div>
  ))
)}
        </div>
      </section>
    )
  }

  export default CategorySection