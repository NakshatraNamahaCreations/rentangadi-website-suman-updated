/**
 * API configuration. VITE_API_BASE overrides everything, so a deployment can
 * point elsewhere without a code change.
 *
 * In dev this stays '/api' and the Vite proxy forwards it, which avoids CORS;
 * the proxy target in vite.config.js decides which backend that is. The second
 * value is what a built site talks to directly.
 */
const HOST = 'https://rentangadi-backend-suman.onrender.com'

export const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (import.meta.env.DEV ? '/api' : HOST + '/api')
/* Only used for records that stored a bare filename; everything in the data
   now holds a full Cloudinary URL, which resolveImage passes through. */
export const UPLOADS_BASE =
  import.meta.env.VITE_UPLOADS_BASE || HOST + '/subcategory'
export const PRODUCT_IMAGE_BASE =
  import.meta.env.VITE_PRODUCT_IMAGE_BASE || HOST + '/product'

// Resolve an image reference to a renderable src.
// New records store full Cloudinary URLs; legacy records store bare filenames.
const resolveImage = (src, base) => {
  if (!src) return ''
  return /^https?:\/\//i.test(src)
    ? src
    : `${base}/${encodeURIComponent(src)}`
}

export const resolveProductImage = (src) => resolveImage(src, PRODUCT_IMAGE_BASE)
export const resolveSubcategoryImage = (src) => resolveImage(src, UPLOADS_BASE)

/** Optional env fallback only. Enquiries send `clientId` from the logged-in user — see `getClientIdFromLoggedInUser`. */
export const DEFAULT_CLIENT_ID = import.meta.env.VITE_DEFAULT_CLIENT_ID || ''

/** Client portal — full enquiry history for the logged-in user */
export const CLIENT_PORTAL_URL =
  import.meta.env.VITE_CLIENT_PORTAL_URL || 'https://client.rentangadi.in/'