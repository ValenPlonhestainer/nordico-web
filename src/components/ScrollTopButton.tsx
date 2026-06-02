'use client'
import { useEffect, useState } from 'react'

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      className={`scroll-top-btn${visible ? ' scroll-top-btn--visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
