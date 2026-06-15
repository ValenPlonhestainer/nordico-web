'use client'
import { useEffect } from 'react'

export default function ScrollAnimInit() {
  useEffect(() => {
    const targets = document.querySelectorAll('[data-anim], [data-anim-stagger]')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
