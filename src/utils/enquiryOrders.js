/**
 * Merge CRM/API enquiries with locally cached ones (instant UI after submit).
 * API wins on duplicate ids (e.g. status updates from CRM).
 */
export function mergeEnquiriesForUser(apiList, localList, userId) {
  const api = Array.isArray(apiList) ? apiList : []
  const local = Array.isArray(localList) ? localList : []

 const localForUser = local.filter((o) => {
  if (!userId) return true

  const id = o.userId || o.clientId // ✅ FIX

  if (!id) return true

  return String(id) === String(userId)
})

  const apiIds = new Set(
    api.map((o) => String(o._id || o.id || '')).filter(Boolean)
  )

  const localOnly = localForUser.filter((o) => {
    const id = String(o._id || o.id || '')
    return id && !apiIds.has(id)
  })

  const combined = [...api, ...localOnly]

  combined.sort((a, b) => {
    const da = new Date(
      a.enquiryDate || a.createdAt || a.date || 0
    ).getTime()
    const db = new Date(
      b.enquiryDate || b.createdAt || b.date || 0
    ).getTime()
    return db - da
  })

  return combined
}

const STATUS_KEYS = [
  'status',
  'enquiryStatus',
  'orderStatus',
  'EnquiryStatus',
  'approvalStatus',
  'ApprovalStatus',
  'crmStatus',
  'bookingStatus',
  'enquiry_state',
  'order_state',
  'statusName',
  'Status',
  'state',
]

function pickFirstString(obj, keys) {
  if (!obj || typeof obj !== 'object') return ''
  for (const k of keys) {
    const v = obj[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      return String(v).trim()
    }
  }
  return ''
}

/**
 * Read raw status string from CRM/API (may use nested objects or alternate keys).
 */
export function getRawStatusFromOrder(order) {
  if (!order || typeof order !== 'object') return ''

  let raw = pickFirstString(order, STATUS_KEYS)
  if (raw) return raw

  const nested =
    order.enquiry ||
    order.Enquiry ||
    order.enquiryDetails ||
    order.order ||
    order.data
  if (nested && typeof nested === 'object') {
    raw = pickFirstString(nested, STATUS_KEYS)
    if (raw) return raw
  }

  return ''
}

/**
 * What to call an enquiry's state, in words a customer can act on.
 *
 * The record stores "not send" until a quotation goes out and "sent"
 * afterwards; an order made from it carries Confirm/cancelled. Those are
 * the only values that occur, so the mapping covers them and falls back to
 * whatever came through for anything new.
 */
export function formatEnquiryStatus(order) {
  const status = order?.orderStatus || order?.status || ""
  const lower = String(status).toLowerCase().trim()

  if (!lower) return "Placed"

  if (lower.includes("cancel")) return "Cancelled"
  if (lower.includes("confirm")) return "Confirmed"

  /* "not send" contains "send", so it has to be ruled out first or every
     unquoted enquiry would read as quoted. */
  if (lower.includes("not send") || lower.includes("not sent")) {
    return "Pending"
  }

  if (lower.includes("pending")) return "Pending"
  if (lower.includes("sent") || lower.includes("send")) {
    return "Quotation Sent"
  }

  return status
}

/** A class suffix for the badge, from the same wording. */
export function enquiryStatusTone(order) {
  switch (formatEnquiryStatus(order)) {
    case "Confirmed":
      return "confirmed"
    case "Quotation Sent":
      return "quoted"
    case "Cancelled":
      return "cancelled"
    case "Pending":
      return "pending"
    default:
      return "placed"
  }
}

/**
 * Extract enquiry array from various API response shapes.
 */
export function normalizeEnquiryListResponse(data) {
  if (!data) return []

  if (Array.isArray(data.orderData)) return data.orderData // ✅ ADD THIS

  if (Array.isArray(data.enquiryData)) return data.enquiryData
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data.enquiries)) return data.enquiries
  if (Array.isArray(data.result)) return data.result
  if (Array.isArray(data.orders)) return data.orders

  if (data.data && Array.isArray(data.data.enquiries)) return data.data.enquiries
  if (data.data && Array.isArray(data.data.data)) return data.data.data

  return []
}

const GST_RATE = 0.18

/**
 * Subtotal (before GST): explicit field, line items, or derived from totals.
 */
export function getEnquirySubtotal(order) {
  if (order?.subtotalBeforeGST != null && order.subtotalBeforeGST !== '') {
    const v = Number(order.subtotalBeforeGST)
    if (!Number.isNaN(v) && v >= 0) return Math.round(v * 100) / 100
  }
  const products = order?.products
  if (Array.isArray(products) && products.length > 0) {
    const sum = products.reduce((s, p) => {
      const line =
        Number(p.total) ||
        (Number(p.qty) || 0) * (Number(p.price) || 0) ||
        0
      return s + line
    }, 0)
    if (sum > 0) return Math.round(sum * 100) / 100
  }
  const gt = Number(order?.GrandTotal ?? order?.total ?? order?.grandTotal ?? 0)
  const gst = Number(order?.GST ?? 0)
  if (gt > 0 && gst > 0 && gt >= gst) {
    return Math.round((gt - gst) * 100) / 100
  }
  return Math.round(gt * 100) / 100
}

/**
 * 18% GST and total. Uses stored subtotalBeforeGST + GST + GrandTotal when present (new enquiries).
 */
export function getEnquiryGstTotals(order) {
  const subtotal = getEnquirySubtotal(order)

  if (
    order?.subtotalBeforeGST != null &&
    order.subtotalBeforeGST !== '' &&
    Number(order.GST) >= 0
  ) {
    const gstAmount = Math.round(Number(order.GST) * 100) / 100
    const totalPayable =
      Number(order.GrandTotal) > 0
        ? Math.round(Number(order.GrandTotal) * 100) / 100
        : Math.round((subtotal + gstAmount) * 100) / 100
    return { subtotal, gstAmount, totalPayable, gstPercent: 18 }
  }

  const gstAmount = Math.round(subtotal * GST_RATE * 100) / 100
  const totalPayable = Math.round((subtotal + gstAmount) * 100) / 100
  return { subtotal, gstAmount, totalPayable, gstPercent: 18 }
}

/** Checkout: subtotal-only number (e.g. cart total before tax). */
export function getGstTotalsFromSubtotal(subtotal) {
  const s = Math.round(Number(subtotal) * 100) / 100 || 0
  const gstAmount = Math.round(s * GST_RATE * 100) / 100
  const totalPayable = Math.round((s + gstAmount) * 100) / 100
  return { subtotal: s, gstAmount, totalPayable, gstPercent: 18 }
}

/** True when CRM/API normalises to Confirmed (same rule as status display). */
// export function isConfirmedEnquiry(order) {
//   return formatEnquiryStatus(order) === 'Confirmed'
// }

export function isConfirmedEnquiry(order) {
  const status =
    order.orderStatus || order.status || ""

  const lower = status.toLowerCase()

  return (
    lower.includes("confirm") ||
    lower.includes("sent")   // ✅ ADD THIS
  )
}

export function countEnquiriesForUser(placedOrders, userId) {
  if (!Array.isArray(placedOrders)) return 0
  if (!userId) return placedOrders.length
  return placedOrders.filter(
    (o) => !o.userId || String(o.userId) === String(userId)
  ).length
}

export function countOpenEnquiriesForUser(placedOrders, userId) {
  if (!Array.isArray(placedOrders)) return 0
  const list = !userId
    ? placedOrders
    : placedOrders.filter(
        (o) => !o.userId || String(o.userId) === String(userId)
      )
  return list.filter((o) => !isConfirmedEnquiry(o)).length
}

export function countConfirmedEnquiriesForUser(placedOrders, userId) {
  if (!Array.isArray(placedOrders)) return 0
  const list = !userId
    ? placedOrders
    : placedOrders.filter(
        (o) => !o.userId || String(o.userId) === String(userId)
      )
  return list.filter((o) => isConfirmedEnquiry(o)).length
}
