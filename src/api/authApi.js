import { API_BASE } from './config'

async function attemptLogin(endpoint, phoneNumber, password) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.error || 'Login failed')
  return data
}

async function fetchClientForExecutive(user) {
  try {
    const res = await fetch(`${API_BASE}/Client/getAllClients`)
    const data = await res.json()
    const clients = data.Client || data.clients || data || []
    if (!Array.isArray(clients)) return user

    // Try matching by clientId on user object first
    const clientId = user.clientId || user.ClientId
    let client = clientId
      ? clients.find((c) => c._id === clientId)
      : null

    // Fallback: find the client whose executives array contains this executive
    if (!client) {
      const execId = user._id || user.id
      const execPhone = user.phoneNumber
      client = clients.find((c) =>
        (c.executives || []).some((e) =>
          e._id === execId || e.phoneNumber === execPhone
        )
      )
    }

    if (client) {
      return {
        ...user,
        companyName: client.name || client.companyName || '',
        clientName: client.name || '',
        clientAddress: client.address || '',
        clientEmail: client.email || '',
        clientPhone: client.phoneNumber || '',
        clientId: client._id,
      }
    }
  } catch (_) { /* ignore */ }
  return user
}

export async function loginUser(phoneNumber, password) {
  let lastError
  for (const endpoint of ['/user/executiveLogin', '/user/login']) {
    try {
      const data = await attemptLogin(endpoint, phoneNumber, password)
      let user = data.user || data.executive || data.data || {}

      // For executives, fetch the assigned client's details
      const role = (user.role || '').toLowerCase()
      if (role === 'executive') {
        user = await fetchClientForExecutive(user)
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(user))
      window.dispatchEvent(new Event('auth-change'))
      return data
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

export const loginExecutive = loginUser
