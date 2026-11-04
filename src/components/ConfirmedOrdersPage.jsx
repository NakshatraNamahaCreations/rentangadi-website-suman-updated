import { useEffect, useMemo } from 'react'
import { useCart } from '../hooks/useCart'
import { useMergedEnquiries } from '../hooks/useMergedEnquiries'
import { isConfirmedEnquiry } from '../utils/enquiryOrders'
import { goBack } from '../navigation/urlSync'
import OrderCard from './OrderCard'
import './OrdersPage.css'
import './ConfirmedOrdersPage.css'

export default function ConfirmedOrdersPage() {
  const { setShowConfirmedOrdersPage } = useCart()
  const { displayOrders, loading } = useMergedEnquiries()

  console.log("ALL ORDERS:", displayOrders)

  const confirmedList = useMemo(() => {
    const getTime = (o) =>
      new Date(o.createdAt || o.updatedAt || o.date || o.enquiryDate || 0).getTime() || 0

    return displayOrders
      .filter(isConfirmedEnquiry)
      .slice()
      .sort((a, b) => getTime(b) - getTime(a))
  }, [displayOrders])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="orders-page confirmed-orders-page">
      
      {/* HEADER */}
      <div className="orders-page-header">
        <h1 className="orders-page-title">Confirmed Orders</h1>

        <button
          type="button"
          className="cart-back-btn orders-back-btn"
          onClick={() => goBack(() => setShowConfirmedOrdersPage(false))}
        >
          Back
        </button>
      </div>

      {/* CONTENT */}
      <div className="orders-page-content">

        {loading ? (
          <p>Loading orders...</p>

        ) : confirmedList.length === 0 ? (

          <div className="orders-empty confirmed-orders-empty">
            <p>You don&apos;t have any confirmed orders yet.</p>

            <button
              type="button"
              className="orders-shop-btn"
              onClick={() => setShowConfirmedOrdersPage(false)}
            >
              Continue Shopping
            </button>
          </div>

        ) : (

          <div className="orders-list">
            {confirmedList.map((order, index) => {
              const orderId =
                order._id ||
                order.id ||
                index

                

              return (
                <OrderCard
                  key={orderId}
                  order={order}
                  index={index}
                  cardClassName="order-card--confirmed"
                />
              )
            })}
          </div>

        )}

      </div>
    </div>
  )
}