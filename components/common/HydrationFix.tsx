'use client'

import { useEffect } from 'react'

// Filter console.error in development to prevent Next.js error overlay
// from popping up when browser extensions inject third-party attributes
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    const errorString = args.map((arg) => (typeof arg === 'string' ? arg : '')).join(' ')
    if (
      errorString.includes('bis_skin_checked') ||
      (errorString.includes('hydration') && errorString.includes('bis_skin_checked'))
    ) {
      return
    }
    originalError(...args)
  }
}

export function HydrationFix() {
  useEffect(() => {
    // Remove any attributes injected by browser extensions
    try {
      document.querySelectorAll('[bis_skin_checked]').forEach((el) => {
        el.removeAttribute('bis_skin_checked')
      })
    } catch {
      // Ignore if not supported
    }
  }, [])

  return null
}
