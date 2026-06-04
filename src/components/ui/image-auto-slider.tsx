'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const images = [
  '/img/Pileta%20Cliente%201.JPG',
  '/img/Pileta%20Cliente%202.JPG',
  '/img/Pileta%20Cliente%204.JPG',
  '/img/Pileta%20Cliente%205.JPG',
  '/img/Pileta%20Cliente%206.JPG',
  '/img/Pileta%20Cliente%207.JPG',
  '/img/Pileta%20Cliente%208.JPG',
  '/img/Pileta%20Cliente%209.JPG',
  '/img/Pileta%20Cliente%2010.jpg',
  '/img/Pileta%20Cliente%2011.JPG',
]

const duplicated = [...images, ...images]

export default function ImageAutoSlider() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), 4000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setIdx(i => (i + 1) % images.length)

  return (
    <>
      <style>{`
        @keyframes scroll-right {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .img-slider-track {
          animation: scroll-right 28s linear infinite;
          display: flex;
          gap: 12px;
          width: max-content;
        }
        .img-slider-track:hover { animation-play-state: paused; }
        .img-slider-item { transition: transform 0.3s ease, filter 0.3s ease; flex-shrink: 0; }
        .img-slider-item:hover { transform: scale(1.04); filter: brightness(1.12); }

        .img-desktop { display: block; }
        .img-mobile  { display: none; }

        @media (max-width: 768px) {
          .img-desktop { display: none; }
          .img-mobile  { display: block; }
        }
      `}</style>

      {/* Desktop: auto-scroll */}
      <div className="img-desktop" style={{
        width: '100%',
        overflow: 'hidden',
        maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}>
        <div className="img-slider-track">
          {duplicated.map((src, i) => (
            <div key={i} className="img-slider-item" style={{ width: '280px', height: '280px', overflow: 'hidden', border: '1px solid var(--border-line)' }}>
              <Image src={src} alt={`Trabajo realizado ${(i % images.length) + 1}`} width={280} height={280} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: slider convencional */}
      <div className="img-mobile">
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4 / 3', border: '1px solid var(--border-line)' }}>
          <Image
            src={images[idx]}
            alt={`Trabajo realizado ${idx + 1}`}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover', transition: 'opacity 0.3s ease' }}
          />
          <button
            onClick={prev}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(14,14,14,0.75)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--white)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer' }}
          >‹</button>
          <button
            onClick={next}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(14,14,14,0.75)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--white)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer' }}
          >›</button>
          <div style={{ position: 'absolute', bottom: '10px', right: '14px', fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)' }}>
            {String(idx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </div>
        </div>
        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
          {images.map((_, i) => (
            <span
              key={i}
              onClick={() => setIdx(i)}
              style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === idx ? 'var(--orange)' : 'var(--dark3)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'block', transition: 'background 0.2s' }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
