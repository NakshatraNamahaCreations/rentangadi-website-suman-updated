import { useEffect, useMemo, useRef, useState } from 'react'
import { useCart } from './useCart'
import { getEnquiriesByUserId } from '../api/enquiryApi'
import {
  getClientIdFromUser,
  getLoggedInUser,
  idOf,
  isExecutiveUser,
} from '../utils/authUser'
import {
  mergeEnquiriesForUser,
  normalizeEnquiryListResponse
} from '../utils/enquiryOrders'

export function useMergedEnquiries() {
  // const { placedOrders } = useCart()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔥 dynamic interval control
  const intervalRef = useRef(null)
  const currentInterval = useRef(5000) // start fast

  useEffect(() => {
    let cancelled = false

    const fetchOrders = async () => {
      try {
        const user = getLoggedInUser()
        /* The list is held against the client, so an executive asks for their
           own client's list and is then narrowed to what they raised. */
        const clientId = getClientIdFromUser(user)

        if (!clientId) {
          setOrders([])
          setLoading(false)
          return
        }

        if (!orders.length && !loading) setLoading(true)

        const res = await getEnquiriesByUserId(clientId)
        let list = normalizeEnquiryListResponse(res)

        /* A client sees everything under them - their own and every enquiry
           their executives raised. An executive sees only their own. */
        if (isExecutiveUser(user)) {
          const mine = String(user?._id || user?.id || '')
          list = (Array.isArray(list) ? list : []).filter(
            (e) => idOf(e?.executiveId) === mine
          )
        }

        if (!cancelled) {
          let hasChanged = false

          setOrders((prev) => {
            const incoming = Array.isArray(list) ? list : []

            const prevMap = new Map(prev.map(o => [o._id, o]))

            const merged = incoming.map((newItem) => {
              const oldItem = prevMap.get(newItem._id)

              if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                hasChanged = true
                return newItem
              }

              return oldItem
            })

            if (!hasChanged && prev.length === merged.length) {
              return prev
            }

            return merged
          })

          // 🔥 ADAPTIVE INTERVAL LOGIC
          if (hasChanged) {
            currentInterval.current = 5000 // fast when updates happening
          } else {
            currentInterval.current = Math.min(currentInterval.current + 5000, 30000)
          }

          restartInterval()
        }

      } catch (err) {
        console.error("❌ Error fetching enquiries:", err)
        if (!cancelled) setOrders([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // 🔥 INTERVAL HANDLER
    const restartInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current)

      intervalRef.current = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchOrders()
        }
      }, currentInterval.current)
    }

    // 🔥 INITIAL LOAD
    fetchOrders()
    restartInterval()

    // 🔥 tab visibility
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        currentInterval.current = 5000 // reset to fast
        fetchOrders()
        restartInterval()
      }
    }

    // 🔥 login/logout refresh
    const onAuthChange = () => {
      currentInterval.current = 5000
      fetchOrders()
      restartInterval()
    }

    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("auth-change", onAuthChange)

    return () => {
      cancelled = true
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("auth-change", onAuthChange)
    }
  }, [])

  // 🔥 memo merged display
  const displayOrders = useMemo(() => {
  return orders
}, [orders])

  return {
    displayOrders,
    loading
  }
}