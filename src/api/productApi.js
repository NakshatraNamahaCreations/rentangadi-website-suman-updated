import { API_BASE, resolveProductImage } from "./config"
import { createSharedFetch } from "./sharedFetch"

/* The whole catalogue in one response, and the slowest call the site makes,
   so it is fetched once and shared rather than once per section. Two minutes
   is short enough that stock figures stay close to live. */
const PRODUCTS_TTL_MS = 2 * 60 * 1000

export const getProducts = createSharedFetch(async () => {
  const res = await fetch(`${API_BASE}/product/getinventoryproducts`)

  if (!res.ok) {
    throw new Error("Failed to fetch products")
  }

  const data = await res.json()

  // API returns ProductsData (capital P)
  return data?.ProductsData ?? data?.productsData ?? []
}, PRODUCTS_TTL_MS)

/**
 * Get products by category - POST with category name in body
 * @param {string} categoryName - Main category name (e.g. "Furnitures")
 * @returns {Promise<Array>} Product array
 */
export async function getProductsByCategory(categoryName) {
  const res = await fetch(`${API_BASE}/product/getProductbycategory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category: categoryName }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Failed to fetch products: ${res.status}${errBody ? ` - ${errBody}` : ''}`)
  }

  const data = await res.json()
  const rawProducts = data?.ProductsData ?? data?.productsData ?? data?.data ?? (Array.isArray(data) ? data : [])
  return Array.isArray(rawProducts) ? rawProducts : []
}

/**
 * Map raw API product to app product shape
 */
// helper function
const clean = (val) => (val && val.trim() !== '' ? val : null)

export function mapProductFromApi(item) {
  if (!item?.ProductIcon) return null

  const imgUrl = resolveProductImage(item.ProductIcon)

  const apiImages = Array.isArray(item.images)
    ? item.images
        .map(img => ({
          url: typeof img === 'object' ? img.url : img,
          color: img?.color || null,
        }))
        .filter(img => img.url)
    : []

  const finalImages = [
    { url: imgUrl, color: clean(item.Color) },
    ...apiImages.filter(img => img.url !== imgUrl),
  ]

   return {
    id: item._id,

    // BASIC
    name: item.ProductName || '',
    description: item.ProductDesc || '',
    price: Number(item.ProductPrice) || 0,
    src: imgUrl,
    images: finalImages,

    // CATEGORY
    productCategory: clean(item.ProductCategory),
    productSubcategory: clean(item.ProductSubcategory),

    // DETAILS
    material: clean(item.Material),
    seater: clean(item.seater),
    dimensions: clean(item.ProductSize),
    color: clean(item.Color),

    // STOCK
    productStock: item.ProductStock ?? null,
    stockAvailable: item.StockAvailable ?? item.ProductStock ?? null,
    availableQty: Number(item.qty ?? item.StockAvailable ?? item.ProductStock) || 0,
    minQty: clean(item.minqty),

    // STATUS
    productStatus: clean(item.ProductStatus),
    activeStatus: item.activeStatus ?? null,

    // COUNTS
    repairCount: item.repairCount ?? 0,
    lostCount: item.lostCount ?? 0,

    // ✅ IMPORTANT FIX (YOUR ISSUE)
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,

    // EXTRA
    dates: item.Dates || [],
    inventory: item.inventory || [],
  }
}
