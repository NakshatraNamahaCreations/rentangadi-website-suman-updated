import { API_BASE } from './config'

function handleFetchError(err) {
  const msg = err?.message || String(err)
  if (
    msg === 'Failed to fetch' ||
    msg === 'Load failed' ||
    /network|fetch|aborted/i.test(msg)
  ) {
    throw new Error(
      'Could not reach the server. Check your internet, VPN, or firewall. Try again, or restart the dev server (npm run dev).'
    )
  }
  throw err
}

export async function createEnquiry(payload) {
  const token = localStorage.getItem("token")
  const url = `${API_BASE}/Enquiry/createEnquiry`

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    handleFetchError(err)
  }

  const text = await res.text()

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("Invalid response")
  }

  if (!res.ok) {
    throw new Error(data.message || "Enquiry failed")
  }

  return data
}

export async function getEnquiriesByUserId(userId) {
  const token = localStorage.getItem("token")

  let res
  try {
    res = await fetch(`${API_BASE}/enquiry/my-enquiries/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
  } catch (err) {
    handleFetchError(err)
  }

  const text = await res.text()

  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error("Invalid response")
  }

  if (!res.ok) {
    throw new Error(data.message || "Fetch failed")
  }

  return data  // ✅ Return full object — let normalizeEnquiryListResponse handle extraction
}

