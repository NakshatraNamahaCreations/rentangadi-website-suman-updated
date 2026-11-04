import { useEffect, useMemo, useState } from 'react'
import { useCart } from '../hooks/useCart'
import { useMergedEnquiries } from '../hooks/useMergedEnquiries'
import { getLoggedInUser, isExecutiveUser } from '../utils/authUser'
import { goBack } from '../navigation/urlSync'

import OrderCard from './OrderCard'
import './OrdersPage.css'

/**
 * Filters run on the date the enquiry was raised, not on its delivery date.
 * "Today" and "Yesterday" only mean anything for the former, and deliveries sit
 * in the future - a delivery-date "Today" would almost always come back empty.
 * The card shows that same raised date as "Enquiry Date" when it is opened.
 */
const RANGES = [
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
  { key: 'custom', label: 'Custom' },
]

/* Midnight today, in the browser's own timezone. */
const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** [from, to) for a named range; null means no date limit. */
function boundsFor(key, fromDate, toDate) {
  const today = startOfToday()

  switch (key) {
    case 'today':
      return [today, addDays(today, 1)]
    case 'yesterday':
      return [addDays(today, -1), today]
    case 'week': {
      /* Week starts on Monday, which is how the business reads a week here. */
      const day = (today.getDay() + 6) % 7
      return [addDays(today, -day), addDays(today, 7 - day)]
    }
    case 'month': {
      const from = new Date(today.getFullYear(), today.getMonth(), 1)
      const to = new Date(today.getFullYear(), today.getMonth() + 1, 1)
      return [from, to]
    }
    case 'year': {
      const from = new Date(today.getFullYear(), 0, 1)
      const to = new Date(today.getFullYear() + 1, 0, 1)
      return [from, to]
    }
    case 'custom': {
      if (!fromDate && !toDate) return null
      const from = fromDate ? new Date(fromDate + 'T00:00:00') : null
      /* Inclusive of the end day, so one day picked twice returns that day. */
      const to = toDate ? addDays(new Date(toDate + 'T00:00:00'), 1) : null
      return [from, to]
    }
    default:
      return null
  }
}

/* DD-MM-YYYY is how the records write a date when createdAt is absent. */
function raisedAt(order) {
  if (order?.createdAt) {
    const d = new Date(order.createdAt)
    if (!isNaN(d)) return d
  }
  const dmy = String(order?.enquiryDate || '').match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1])
  return null
}

export default function OrdersPage() {
  const { setShowOrdersPage } = useCart()
  const { displayOrders, loading } = useMergedEnquiries()

  const [rangeKey, setRangeKey] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [executive, setExecutive] = useState('all')

  /* An executive only ever sees their own enquiries, so filtering by executive
     would be a control with one answer. It is a client's tool. */
  const showExecutiveFilter = !isExecutiveUser(getLoggedInUser())

  const sorted = useMemo(() => {
    const getTime = (o) =>
      new Date(o.createdAt || o.updatedAt || o.date || o.enquiryDate || 0).getTime() || 0

    return [...displayOrders].sort((a, b) => getTime(b) - getTime(a))
  }, [displayOrders])

  /* Every executive who appears in the list, so the dropdown offers only the
     names that can actually match something. */
  const executives = useMemo(() => {
    const set = new Set()
    sorted.forEach((o) => {
      const name = String(o?.executivename || '').trim()
      if (name) set.add(name)
    })
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [sorted])

  const allEnquiries = useMemo(() => {
    const bounds = boundsFor(rangeKey, fromDate, toDate)

    return sorted.filter((o) => {
      if (executive !== 'all') {
        const name = String(o?.executivename || '').trim()
        if (executive === '__none__') {
          if (name) return false
        } else if (name !== executive) {
          return false
        }
      }

      if (bounds) {
        const [from, to] = bounds
        const at = raisedAt(o)
        /* A record with no readable date cannot sit inside a range. */
        if (!at) return false
        if (from && at < from) return false
        if (to && at >= to) return false
      }

      return true
    })
  }, [sorted, rangeKey, fromDate, toDate, executive])

  const hasFilters =
    rangeKey !== 'all' || executive !== 'all' || !!fromDate || !!toDate

  const clearFilters = () => {
    setRangeKey('all')
    setFromDate('')
    setToDate('')
    setExecutive('all')
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="orders-page">
      <div className="orders-page-header">
        <h1 className="orders-page-title">My Enquiries</h1>
        <button
          type="button"
          className="cart-back-btn orders-back-btn"
          onClick={() => goBack(() => setShowOrdersPage(false))}
        >
          Back
        </button>
      </div>

      {/* ---- Filters ---- */}
      <div className="enq-filters">
        <div className="enq-filters__ranges" role="group" aria-label="Filter by date raised">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`enq-chip${rangeKey === r.key ? ' is-active' : ''}`}
              onClick={() => setRangeKey(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="enq-filters__row">
          {rangeKey === 'custom' ? (
            <div className="enq-filters__dates">
              <label className="enq-field">
                <span>From</span>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              <label className="enq-field">
                <span>To</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </label>
            </div>
          ) : null}

          {showExecutiveFilter && executives.length > 0 ? (
            <label className="enq-field">
              <span>Executive</span>
              <select
                value={executive}
                onChange={(e) => setExecutive(e.target.value)}
              >
                <option value="all">All executives</option>
                {executives.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="__none__">Raised by me</option>
              </select>
            </label>
          ) : null}

          <span className="enq-filters__count">
            {loading
              ? 'Loading…'
              : `${allEnquiries.length} of ${sorted.length} enquiries`}
          </span>

          {hasFilters ? (
            <button type="button" className="enq-clear" onClick={clearFilters}>
              Clear
            </button>
          ) : null}
        </div>
      </div>

      <div className="orders-page-content">
        {loading ? (
          <p>Loading enquiries...</p>
        ) : allEnquiries.length === 0 ? (
          <div className="orders-empty">
            <p>
              {hasFilters
                ? 'No enquiries match these filters.'
                : 'You have not made any enquiries yet.'}
            </p>
            <button
              type="button"
              className="orders-shop-btn"
              onClick={() =>
                hasFilters ? clearFilters() : setShowOrdersPage(false)
              }
            >
              {hasFilters ? 'Clear filters' : 'Continue Shopping'}
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {allEnquiries.map((order, index) => {
              const orderId = order._id || order.id || index
              return (
                <OrderCard
                  key={orderId}
                  order={order}
                  index={index}
                  showOrderDetailsPortal
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
