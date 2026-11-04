  import { useEffect, useState } from "react"
  import { API_BASE, PRODUCT_IMAGE_BASE, resolveProductImage } from "../api/config"
  import {
    getEnquiryGstTotals,
    formatEnquiryStatus,
    enquiryStatusTone,
  } from "../utils/enquiryOrders"

  /* ----------------------------- */
  /* API_BASE comes from the config now. It used to be rebuilt here by
     stripping "/product" off the image base, which meant this file carried its
     own idea of where the API lives - and that idea did not include /api. */

  const imageCache = {}

  /* ----------------------------- */
  async function normalizeProducts(products) {
    const normalized = await Promise.all(
      (products || []).map(async (p) => {
        const name = p.productName || p.name || "Product"

        let image =
          p.productImage ||
          p.image ||
          p.ProductIcon ||
          null

        if (image && image.startsWith("http")) {
          return { ...p, name, image }
        }

        if (p.productId && imageCache[p.productId]) {
          return { ...p, name, image: imageCache[p.productId] }
        }

        if (p.productId) {
          try {
            const res = await fetch(
              /* API_BASE ends in /api, so only the route goes here. */
              `${API_BASE}/product/product-details/${p.productId}`
            )
            const data = await res.json()
            const product = data?.product

            if (product?.images?.length) {
              image = product.images[0]?.url || null
            } else if (product?.ProductIcon) {
              image = resolveProductImage(product.ProductIcon)
            }

            imageCache[p.productId] = image
          } catch (err) {
            console.error("Image fetch error:", err)
          }
        }

        if (image) {
          image = resolveProductImage(image)
        }

        return { ...p, name, image: image || "" }
      })
    )

    return normalized
  }

  /* ----------------------------- */
  export default function OrderCard({ order,  index  }) {
    const [products, setProducts] = useState(order.products || [])
    const [showModal, setShowModal] = useState(false)
    const eventDays = getEventDays(order.enquiryDate, order.endDate)

   const mergedProducts = Object.values(
  (products || []).reduce((acc, item) => {
    const key = item.productId || item.name

    // ✅ keep only ONE entry (ignore duplicates)
    if (!acc[key]) {
      acc[key] = { ...item }
    }

    return acc
  }, {})
)

    const firstProduct = products[0]

    /* ✅ FIXED: PROPER TOTALS */
    // const { subtotal = 0, gstAmount = 0, totalPayable = 0 } =
    //   getEnquiryGstTotals(order) || {}

    const baseSubtotal = mergedProducts.reduce(
  (sum, p) => sum + (p.total || p.qty * p.price || 0),
  0
)

const subtotal = baseSubtotal * (eventDays || 1)

const gstAmount = subtotal * 0.18

const totalPayable = subtotal + gstAmount

    const total =
      products.reduce(
        (sum, p) => sum + (p.total || p.qty * p.price || 0),
        0
      ) || totalPayable

    /* LOAD IMAGES */
    useEffect(() => {
      let mounted = true

      async function load() {
        const data = await normalizeProducts(order.products)
        if (mounted) setProducts(data)
      }

      load()

      return () => (mounted = false)
    }, [order])

    function formatEnquiryId(order, index = 0) {
    // use enquiryId if available, else fallback to index
    const num =
      order?.enquiryId ||
      parseInt(String(order?._id || "").replace(/\D/g, "").slice(-4)) ||
      index + 1

    return `RA${String(num).padStart(4, "0")}`
  }

  function getEventDays(start, end) {
  if (!start || !end) return "-"

  const parseDate = (str) => {
    const [day, month, year] = str.split("-")
    return new Date(`${year}-${month}-${day}`)
  }

  const startDate = parseDate(start)
  const endDate = parseDate(end)

  if (isNaN(startDate) || isNaN(endDate)) return "-"

  const diffTime = endDate - startDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  return diffDays
}

    return (
      <>
        {/* ================= CARD ================= */}
    <div
    className="order-card-simple"
    onClick={() => setShowModal(true)}
    style={{ cursor: "pointer" }}
  >

    {/* LEFT IMAGE */}
    <div className="simple-img">
      <img
        src={firstProduct?.image || "/placeholder.png"}
        alt={firstProduct?.name}
      />
    </div>

    {/* RIGHT CONTENT */}
    <div className="card-content">

      <h4 className="simple-title">
        {firstProduct?.name || "Product"}
      </h4>

      <p className="simple-date">
        Delivery Date: {order?.enquiryDate || "-"}
      </p>

      <span
        className={`enq-status is-${enquiryStatusTone(order)}`}
      >
        {formatEnquiryStatus(order)}
      </span>

      <div className="card-footer">
        <p className="simple-total">
          ₹ {totalPayable.toLocaleString("en-IN")}
        </p>

      <button
    className="view-btn"
    onClick={(e) => {
      e.stopPropagation()   // 🔥 prevents parent click
      setShowModal(true)
    }}
  >
    View Details
  </button>
      </div>

    </div>
  </div>

        {/* ================= MODAL ================= */}
    {showModal && (
    <div className="order-modal-overlay">
      <div className="order-modal invoice-style">

        <button
          className="close-btn"
          onClick={() => setShowModal(false)}
        >
          ✕
        </button>

        {/* ✅ HEADER */}
        <div className="invoice-header">
          <h3>
          Enquiry #{formatEnquiryId(order, index)}
          <span
            className={`enq-status is-${enquiryStatusTone(order)}`}
          >
            {formatEnquiryStatus(order)}
          </span>
          </h3>

          <p>
  <strong>Enquiry Date:</strong>{" "}
  {order?.createdAt
    ? new Date(order.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit", // 🔥 added seconds
        hour12: true,
      })
    : "Not Available"}
</p>
        </div>

        {/* ✅ TOP GRID BODY */}
        <div className="invoice-top-grid">

          {/* LEFT */}
          <div className="invoice-left">
  <p><strong>Company Name:</strong> {order.clientName || "-"}</p>
  <p><strong>Executive Name:</strong> {order.executivename || "-"}</p>
  <p><strong>Address:</strong> {order.address || "-"}</p>

</div>

          {/* RIGHT */}
          <div className="invoice-right">
            <p><strong>Slot:</strong> {order.enquiryTime || "-"}</p>
          <p>
  <strong>Delivery Date:</strong> {order.enquiryDate || "-"}
</p>
            <p><strong>Dismantle Date:</strong> {order.endDate || "-"}</p>
          </div>

        </div>

        <hr />

        {/* ITEMS */}
        <div className="invoice-section">
          <p className="section-title">Items:</p>

          <div className="invoice-items-box">
            {mergedProducts.map((p, i) => (
              <div key={i} className="invoice-item">
                <img src={p.image || "/placeholder.png"} alt={p.name} />

                <div className="item-info">
                  <p>{p.name} × {p.qty}</p>
                  <span>
                    ₹ {(p.total || p.qty * p.price || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOTALS */}
        <div className="invoice-totals">
          
  {/* ✅ NEW */}
  <div>
  <span>Event Days:{" "} </span>
 <span>
  {getEventDays(order.enquiryDate, order.endDate)}{" "}
  {getEventDays(order.enquiryDate, order.endDate) === 1 ? "day" : "days"}
</span>
 
  </div>
          <div>
            <span>Subtotal</span>
            <span>₹ {subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div>
            <span>GST (18%)</span>
            <span>₹ {gstAmount.toLocaleString("en-IN")}</span>
          </div>

          <div className="grand-total">
            <strong>Total amount</strong>
            <strong>₹ {totalPayable.toLocaleString("en-IN")}</strong>
          </div>

          <p className="status">
            Status: <span>{order.orderStatus || order.status || "-"}</span>
          </p>
        </div>

        {/* CTA */}
        <button
    className="invoice-btn"
    onClick={() => window.open("https://client.rentangadi.in/", "_blank")}
  >
    Request For Quotation
  </button>

      </div>
    </div>
  )}
      </>
    )
  }