import { useState, useEffect, useRef } from 'react'
import { useCart } from '../hooks/useCart'
import QuantitySelector from './QuantitySelector'
import { createEnquiry } from '../api/enquiryApi'
import {
  getClientIdFromLoggedInUser,
  getExecutiveIdFromLoggedInUser,
  getLoggedInUser,
} from '../utils/authUser'
import { getGstTotalsFromSubtotal } from '../utils/enquiryOrders'
import PostLoginWelcome from './PostLoginWelcome'
import LoginModal from './LoginModal'
import './CartPage.css'

function CartItemsList({ cart, addToCart, setQty, removeFromCart, cartTotal }) {
  return (
    <>
      <div className="cart-items-list">
        {cart.map((item) => {
          const imgSrc = item.src || (item.images && item.images[0])
          return (
            <div key={item.id} className="cart-item-row">
              <div className="cart-item-thumb">
                {imgSrc ? (
                  <img src={imgSrc} alt={item.name} className="cart-item-img" />
                ) : (
                  <div className="cart-item-img-placeholder" />
                )}
              </div>

              <div className="cart-item-info">
                <span>{item.name}</span>
              </div>

              <div className="cart-item-actions">
                <QuantitySelector
                  qty={item.qty}
                  onSetQty={(v) => setQty(item.id, v)}
                  max={item.availableQty > 0 ? item.availableQty : Number(item.productStock) || 0}
                />

                <span>₹ {(item.price * item.qty).toLocaleString('en-IN')}</span>

                <button onClick={() => removeFromCart(item.id)} className='remove-btn'>
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="cart-notice">
        <strong>Note:</strong> Additional charges such as Transportation and Manpower will be charged by Rent Angadi.
      </div>

      <div className="cart-totals">
        Sub Total: ₹ {cartTotal.toLocaleString('en-IN')}
      </div>
    </>
  )
}

const formatDMY = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}-${m}-${y}`
}

const now = () => {
  const d = new Date()
  return {
    date: formatDMY(d.toISOString().split('T')[0]),
    time: d.toTimeString().slice(0, 8),
  }
}

const DELIVERY_SLOTS = [
  { value: 'slot1', label: 'Slot 1: Event Day- 7:00 AM to 11:00 PM' },
  { value: 'slot2', label: 'Slot 2: Previous Day- 11:00 PM to Event Day- 11:45 PM' },
  { value: 'slot3', label: 'Slot 3: Event Day- 7:30 AM to 4:00 PM' },
  { value: 'slot4', label: 'Slot 4: Event Day- 2:45 PM to 11:45 PM' },
]

export default function CartPage() {
  const {
    cart,
    addToCart,
    setQty,
    removeFromCart,
    cartTotal,
    setShowCartPage,
    setShowOrdersPage,
    clearCart,
    addPlacedOrder,
  } = useCart()

  function getEventDays(start, end) {
  if (!start || !end) return 1

  const startDate = new Date(start)
  const endDate = new Date(end)

  if (isNaN(startDate) || isNaN(endDate)) return 1

  const diffTime = endDate - startDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  return diffDays > 0 ? diffDays : 1
}

  const [showCheckout, setShowCheckout] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPostLoginWelcome, setShowPostLoginWelcome] = useState(false)
  const [userRole, setUserRole] = useState('')

  const [formData, setFormData] = useState({
    companyName: '',
    executiveName: '',
    eventDate: '',
    deliveryDate: '',
    dismantleDate: '',
    slot: '',
    venueAddress: '',

    fullName: '',
    billingAddress: '',
    clientNo: '',
    endDate: '',
    placeaddress: '',
    category: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [formTouched, setFormTouched] = useState(false)
  const [slotDropdownOpen, setSlotDropdownOpen] = useState(false)
  const slotDropdownRef = useRef(null)


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (slotDropdownRef.current && !slotDropdownRef.current.contains(e.target)) {
        setSlotDropdownOpen(false)
      }
    }
    if (slotDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [slotDropdownOpen])


  useEffect(() => {
    if (showCheckout && (!cart.length || cartTotal <= 0)) {
      setShowCheckout(false)
    }
  }, [showCheckout, cart.length, cartTotal])


  const populateFromUser = () => {
    const raw = localStorage.getItem("user")
    const today = new Date().toISOString().split("T")[0]
    const defaults = { endDate: today }
    if (raw) {
      try {
        const u = JSON.parse(raw)
        const role = (u.role || '').toLowerCase()
        setUserRole(role)

        if (role === 'executive') {
          defaults.executiveName = u.name || ''
          defaults.companyName = u.companyName || ''
          defaults.fullName = u.clientName || u.companyName || ''
          defaults.clientNo = u.clientPhone || u.phoneNumber || ''
          defaults.venueAddress = ''
        } else {
          defaults.companyName = u.name || u.companyName || ''
          defaults.fullName = u.name || ''
          defaults.clientNo = u.phoneNumber || ''
          defaults.venueAddress = ''
          defaults.executiveName = ''
        }
      } catch (_) {}
    }
    setFormData((prev) => ({
      ...prev,
      ...defaults,
    }));
  }

  useEffect(() => {
    populateFromUser()
  }, [showCheckout])

  // Re-populate when user logs in while on checkout
  useEffect(() => {
    const sync = () => populateFromUser()
    window.addEventListener('auth-change', sync)
    return () => window.removeEventListener('auth-change', sync)
  }, [])


  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    setShowCheckout(true)
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setFormTouched(true)

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Login required")
      return
    }

    if (!cart.length || cartTotal <= 0) {
      alert("Your cart is empty. Please add items before placing an order.")
      setShowCheckout(false)
      return
    }

    // Scroll to first invalid field
    const form = e.target
    const firstInvalid = form.querySelector('input:invalid, textarea:invalid')
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstInvalid.focus()
      return
    }
    if (!formData.slot) {
      const slotEl = form.querySelector('.cart-slot-dropdown-trigger')
      if (slotEl) slotEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (
      formData.deliveryDate &&
      formData.dismantleDate &&
      formData.dismantleDate < formData.deliveryDate
    ) {
      alert('Dismantle date must be on or after the delivery date.')
      return
    }

    if (
      formData.eventDate &&
      formData.deliveryDate &&
      formData.dismantleDate &&
      (formData.eventDate < formData.deliveryDate ||
        formData.eventDate > formData.dismantleDate)
    ) {
      alert('Event date must fall between the start date and end date.')
      return
    }

    setSubmitting(true)

    const { date, time } = now()

    /* Who raised this. Only an executive goes in executiveId: it is read back
       to show an executive their own enquiries, and a client's id there would
       file the client under an executive that does not exist. */
    const executiveId = getExecutiveIdFromLoggedInUser()
    const loggedInUser = getLoggedInUser()
    const loggedInUserId = loggedInUser?._id || loggedInUser?.id || ''

    const clientId = getClientIdFromLoggedInUser()
    if (!clientId) {
      alert(
        "Client ID is missing from your account. Please log out and log in again, or contact support."
      )
      setSubmitting(false)
      return
    }

    // const deliveryDateDMY = formatDMY(formData.enquiryDate) || date
    const deliveryDateDMY = formatDMY(formData.deliveryDate) || date
    const dismantleDateDMY = formatDMY(formData.dismantleDate) || formatDMY(formData.endDate) || date
    const eventDateDMY = formatDMY(formData.eventDate) || deliveryDateDMY

    const { subtotal: subBeforeGst, gstAmount, totalPayable } =
      getGstTotalsFromSubtotal(cartTotal)

    const payload = {
  clientId,
  executiveId: executiveId || undefined,

  enquiryDate: deliveryDateDMY,
  enquiryTime: DELIVERY_SLOTS.find((s) => s.value === formData.slot)?.label || time,

  eventDate: eventDateDMY,
  endDate: dismantleDateDMY,

  clientName: formData.fullName || formData.companyName,

  // ⚠️ IMPORTANT: backend uses this (lowercase n)
  executivename: formData.executiveName,

  clientNo: formData.clientNo,

  address: formData.venueAddress || formData.billingAddress,
  placeaddress: formData.placeaddress || "",

  category: formData.category || "",

  products: cart.map((item) => ({
    productId: item.id,

    // ⚠️ Backend supports BOTH, but use this:
    productName: item.name,

    qty: item.qty,
    price: item.price,
    total: item.price * item.qty,

    // optional (only if exists)
    productImage: item.src || (item.images && item.images[0]) || "",
  })),

  GST: gstAmount || 0,
  GrandTotal: totalPayable,
  discount: 0,

  status: "not send",

  followupStatus: "",
  termsandCondition: [],
}

    try {
      const response = await createEnquiry(payload)

    
      // addPlacedOrder({
      //   ...payload,
      //   id: response?._id || Date.now().toString(),
      //   _id: response?._id,
      //   userId: loggedInUserId,
      //   status: 'Placed',
      //   createdAt: response?.createdAt || new Date().toISOString(),
      // })

      alert("Enquiry created successfully ✅")

      clearCart()

    
      setShowCheckout(false)
      setShowOrdersPage(true)

    } catch (err) {
      alert(err.message)
    }

    setSubmitting(false)
  }

  if (showPostLoginWelcome) {
    return (
      <div className="cart-page">
        <PostLoginWelcome
          onContinue={() => {
            setShowPostLoginWelcome(false)
            setShowCheckout(true)
          }}
          onBack={() => setShowPostLoginWelcome(false)}
        />
      </div>
    )
  }

  // ✅ CHECKOUT UI
  if (showCheckout) {
    // const checkoutGst = getGstTotalsFromSubtotal(cartTotal)
    const eventDays = getEventDays(formData.deliveryDate, formData.dismantleDate)

const baseSubtotal = cartTotal

const subtotal = baseSubtotal * eventDays

const gstAmount = subtotal * 0.18

const totalPayable = subtotal + gstAmount
    return (
      <div className="cart-page cart-checkout-page">
        <div className="cart-checkout-header">
          <button
            type="button"
            className="cart-back-btn"
            onClick={() => setShowCheckout(false)}
          >
            ← Back to Cart
          </button>
          <h2>Checkout</h2>
        </div>

        <form className={`cart-checkout-form${formTouched ? ' form-touched' : ''}`} onSubmit={handlePlaceOrder}>
          <h3 className="cart-checkout-form-title">Create Enquiry</h3>

          <div className="cart-form-row cart-form-row-two">
            <div className="cart-form-group">
              <label>Company Name *</label>
              <input
  type="text"
  placeholder="Company Name"
  value={formData.companyName}
  readOnly
  aria-readonly="true"
  className="readonly-input"
  required
/>
            </div>
            {userRole === 'executive' && (
              <>
                {/* <div className="cart-form-group">
                  <label>Client Name</label>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div> */}
                <div className="cart-form-group">
                  <label>Executive Name</label>
                  <input
  type="text"
  placeholder="Executive Name"
  value={formData.executiveName}
  readOnly
  aria-readonly="true"
  className="readonly-input"
/>
                </div>
              </>
            )}
          </div>

          {/* Row: Start Date | End Date | Event Date */}
          <div className="cart-form-row cart-form-row-three">
            <div className="cart-form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.deliveryDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const next = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    deliveryDate: next,
                    // Clear dismantle date if it now falls before delivery
                    dismantleDate:
                      prev.dismantleDate && prev.dismantleDate < next
                        ? ''
                        : prev.dismantleDate,
                    // Clear event date if it now falls before delivery
                    eventDate:
                      prev.eventDate && prev.eventDate < next
                        ? ''
                        : prev.eventDate,
                  }))
                }}
                required
              />
            </div>
            <div className="cart-form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={formData.dismantleDate}
                min={formData.deliveryDate || new Date().toISOString().split('T')[0]}
                disabled={!formData.deliveryDate}
                onChange={(e) => {
                  const next = e.target.value
                  setFormData((prev) => ({
                    ...prev,
                    dismantleDate: next,
                    // Clear event date if it now falls after end date
                    eventDate:
                      prev.eventDate && next && prev.eventDate > next
                        ? ''
                        : prev.eventDate,
                  }))
                }}
                required
              />
            </div>
            <div className="cart-form-group">
              <label>Event Date *</label>
              <input
                type="date"
                value={formData.eventDate}
                min={formData.deliveryDate || new Date().toISOString().split('T')[0]}
                max={formData.dismantleDate || undefined}
                disabled={!formData.deliveryDate || !formData.dismantleDate}
                onChange={(e) =>
                  setFormData({ ...formData, eventDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Row: Select Slot */}
          <div className="cart-form-row cart-form-row-two">
            <div className={`cart-form-group cart-slot-dropdown-wrap${formTouched && !formData.slot ? ' slot-invalid' : ''}`} ref={slotDropdownRef}>
              <label>Select Slot *</label>
              <div className="cart-slot-dropdown">
                <button
                  type="button"
                  className="cart-slot-dropdown-trigger"
                  onClick={() => setSlotDropdownOpen(!slotDropdownOpen)}
                  aria-expanded={slotDropdownOpen}
                >
                  <span>
                    {formData.slot
                      ? DELIVERY_SLOTS.find((s) => s.value === formData.slot)?.label
                      : 'Select Delivery & Dismantle Slots'}
                  </span>
                  <span className="cart-slot-dropdown-chevron">▼</span>
                </button>
                {slotDropdownOpen && (
                  <div className="cart-slot-dropdown-menu">
                    <div className="cart-slot-dropdown-header">
                      Select Delivery & Dismantle Slots
                    </div>
                    {DELIVERY_SLOTS.map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        className="cart-slot-dropdown-option"
                        onClick={() => {
                          setFormData({ ...formData, slot: slot.value })
                          setSlotDropdownOpen(false)
                        }}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 3: Venue Address */}
          <div className="cart-form-group">
            <label>Venue Address *</label>
            <textarea
  name="venueAddress"
  autoComplete="off"
  placeholder="Enter venue address"
  value={formData.venueAddress}
  onChange={(e) =>
    setFormData({ ...formData, venueAddress: e.target.value })
  }
  rows={3}
  required
/>
          </div>

          <div className="cart-charges-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Additional charges such as Transportation and Manpower will be charged by Rent Angadi.
          </div>

          <p className="cart-checkout-total-line">
  <span>Event Days</span>
  <span>
    {eventDays} {eventDays === 1 ? "day" : "days"}
  </span>
</p>

          <div className="cart-checkout-totals">
           <p className="cart-checkout-total-line">
  <span>Subtotal ({eventDays} days)</span>
  <span>₹ {subtotal.toLocaleString('en-IN')}</span>
</p>

<p className="cart-checkout-total-line">
  <span>GST (18%)</span>
  <span>₹ {Math.round(gstAmount).toLocaleString('en-IN')}</span>
</p>

<p className="cart-checkout-total-line cart-checkout-total-final">
  <strong>Total amount</strong>
  <strong>
    ₹ {Math.round(totalPayable).toLocaleString('en-IN')}
  </strong>
</p>
          </div>

          <button
            type="submit"
            className="cart-place-order-btn"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Request For Quotation"}
          </button>
        </form>
      </div>
    )
  }

  // ✅ CART UI
  return (
    <div className="cart-page">
      <div className="cart-main-content">
        <div className="cart-page-header-row">
          <button
            type="button"
            className="cart-back-btn"
            onClick={() => setShowCartPage(false)}
          >
            ← Back to Home
          </button>
          <h1>Your Cart</h1>
        </div>

        <CartItemsList
          cart={cart}
          addToCart={addToCart}
          setQty={setQty}
          removeFromCart={removeFromCart}
          cartTotal={cartTotal}
        />

        <button
          className="cart-proceed-btn"
          onClick={() => {
            if (!cart.length || cartTotal <= 0) {
              alert("Your cart is empty. Please add items before proceeding.")
              return
            }
            const token = localStorage.getItem("token")
            if (!token) setShowLoginModal(true)
            else setShowCheckout(true)
          }}
          disabled={!cart.length || cartTotal <= 0}
        >
          Proceed to Book
        </button>
      </div>

      {showLoginModal && (
        <LoginModal onClose={handleLoginSuccess} />
      )}
    </div>
  )
}