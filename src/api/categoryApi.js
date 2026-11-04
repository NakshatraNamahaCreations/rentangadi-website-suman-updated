import { API_BASE } from './config'
import { createSharedFetch } from './sharedFetch'

/* There was a time cache here already, but three sections ask for this as
   they mount and all three started before the first response landed, so each
   saw an empty cache and fetched again. Sharing the in-flight request is what
   actually collapses them into one. */
const SUBCAT_TTL_MS = 60_000

export const getSubCategories = createSharedFetch(async () => {
  const res = await fetch(`${API_BASE}/subcategory/getappsubcat`)
  if (!res.ok) {
    throw new Error(`Failed to fetch subcategories: ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  return data.subcategory || []
}, SUBCAT_TTL_MS)
