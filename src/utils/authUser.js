/**
 * Client ID from API user object (after login). Tries common field names.
 */
export function getClientIdFromUser(user) {
  if (!user || typeof user !== 'object') return ''
  // Check explicit clientId fields first
  const v =
    user.clientId ?? user.ClientId ?? user.client_id ?? user.clientID
  if (v !== undefined && v !== null && String(v).trim()) return String(v).trim()
  // For client-role users, their own _id IS the clientId
  const role = (user.role || user.Role || '').toLowerCase()
  if (role === 'client' || role === 'user') {
    const id = user._id || user.id || ''
    if (id) return String(id).trim()
  }
  // Fallback: if no explicit clientId and no role, use _id
  const fallbackId = user._id || user.id || ''
  return fallbackId ? String(fallbackId).trim() : ''
}

export function getClientIdFromLoggedInUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return ''
    return getClientIdFromUser(JSON.parse(raw))
  } catch {
    return ''
  }
}

/**
 * Role of the logged-in user, lowercased. Records write it as `role`, and a
 * couple of older responses as `Role`.
 */
export function getRoleFromUser(user) {
  if (!user || typeof user !== 'object') return ''
  return String(user.role ?? user.Role ?? '').trim().toLowerCase()
}

/** An executive works under a client and sees only what they raised. */
export function isExecutiveUser(user) {
  return getRoleFromUser(user) === 'executive'
}

export function getLoggedInUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * The logged-in user's own id when they are an executive, otherwise ''.
 *
 * Enquiries carry `executiveId` to say who raised them, so this must be empty
 * for a client - a client is not an executive, and writing their id there would
 * file their own enquiries under an executive who does not exist.
 */
export function getExecutiveIdFromLoggedInUser() {
  const user = getLoggedInUser()
  if (!isExecutiveUser(user)) return ''
  const id = user?._id || user?.id || ''
  return id ? String(id).trim() : ''
}

/**
 * Reads an id that may arrive raw or populated, since the API populates
 * `executiveId` on some responses and leaves it as an id on others.
 */
export function idOf(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value._id) return String(value._id)
  return ''
}
