'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LightboxProps {
  images: string[]
  initialIndex?: number
  alt: string
  onClose: () => void
}

export default function Lightbox({ images, initialIndex = 0, alt, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % images.length)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, images.length])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.93)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: '20px', right: '24px',
          background: 'none', border: 'none', color: '#888',
          fontSize: '28px', cursor: 'pointer', lineHeight: 1, zIndex: 10000,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#888')}
      >
        ✕
      </button>

      <div
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={alt}
          width={1400}
          height={1000}
          style={{
            maxWidth: '90vw', maxHeight: '80vh',
            width: 'auto', height: 'auto',
            objectFit: 'contain', display: 'block',
          }}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setIndex(i => (i - 1 + images.length) % images.length)}
              style={{
                position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', fontSize: '28px', cursor: 'pointer',
                width: '40px', height: '40px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >‹</button>
            <button
              onClick={() => setIndex(i => (i + 1) % images.length)}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)',
                color: 'white', fontSize: '28px', cursor: 'pointer',
                width: '40px', height: '40px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >›</button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          style={{ display: 'flex', gap: '8px', marginTop: '16px' }}
          onClick={e => e.stopPropagation()}
        >
          {images.map((_, i) => (
            <span
              key={i}
              onClick={() => setIndex(i)}
              style={{
                width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                background: i === index ? '#E8521A' : 'rgba(255,255,255,0.3)',
                display: 'inline-block', transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
