import { useState, useRef, useEffect } from 'react'
import './QuantitySelector.css'

export default function QuantitySelector({ qty, onSetQty, max, disabled = false }) {
  const [inputVal, setInputVal] = useState(String(qty))
  const inputRef = useRef(null)
  const hasMax = typeof max === 'number' && max > 0

  useEffect(() => {
    setInputVal(String(qty))
  }, [qty])

 const commit = (val) => {
  let parsed = parseInt(val ?? inputVal, 10)

  if (isNaN(parsed)) parsed = qty

  const clamped = hasMax
    ? Math.max(1, Math.min(parsed, max))
    : Math.max(1, parsed)

  if (onSetQty) onSetQty(clamped)
  setInputVal(String(clamped))
}

  const increment = () => {
    const current = parseInt(inputVal, 10) || qty
    if (hasMax && current >= max) return
    const next = current + 1
    setInputVal(String(next))
    if (onSetQty) onSetQty(next)
  }

  const decrement = () => {
    const next = Math.max((parseInt(inputVal, 10) || qty) - 1, 1)
    setInputVal(String(next))
    if (onSetQty) onSetQty(next)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); inputRef.current?.blur() }
  }

  return (
    <div className="qty-wrap" onClick={(e) => e.stopPropagation()}>
      <div className="qty-input-row">
        <button
          type="button"
          className="qty-step-btn"
          onClick={decrement}
          disabled={disabled || (parseInt(inputVal, 10) || qty) <= 1}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
  ref={inputRef}
  type="text"   // 🔥 important change
  inputMode="numeric"
  pattern="[0-9]*"
  className="qty-input"
  value={inputVal}
  disabled={disabled}
  onChange={(e) => {
    let value = e.target.value

    // Allow empty while typing
    if (value === '') {
      setInputVal(value)
      return
    }

    // 🚫 Block non-numeric completely
    if (!/^\d+$/.test(value)) return

    let num = parseInt(value, 10)

    if (num < 1) num = 1
    if (hasMax && num > max) num = max

    setInputVal(String(num))

    // Optional (live update)
    if (onSetQty) onSetQty(num)
  }}
  onBlur={() => commit()}
  onKeyDown={handleKeyDown}
  aria-label="Enter quantity"
/>
        <button
          type="button"
          className="qty-step-btn"
          onClick={increment}
          disabled={disabled || (hasMax && (parseInt(inputVal, 10) || qty) >= max)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      {typeof max === 'number' && max >= 0 && (
        <span className="qty-available">Max Available: {max}</span>
      )}
    </div>
  )
}
