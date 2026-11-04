import { useState, useEffect } from 'react'

function readToken() {
  try {
    return !!localStorage.getItem('token')
  } catch {
    return false
  }
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(readToken)

  useEffect(() => {
    const sync = () => setIsLoggedIn(readToken())
    window.addEventListener('auth-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('auth-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return { isLoggedIn }
}

export function openLoginModal() {
  window.dispatchEvent(new Event('open-login'))
}
