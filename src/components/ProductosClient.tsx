'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { useProducts } from '@/hooks/useProducts'
import { useBaldosas } from '@/hooks/useBaldosas'
import Footer from '@/components/Footer'
import SectionDivider from '@/components/SectionDivider'
import Lightbox from '@/components/Lightbox'

function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const move = (clientX: number) => {
    if (!ref.current) return
    const { left, width } = ref.current.getBoundingClientRect()
    setPosition(Math.min(100, Math.max(0, ((clientX - left) / width) * 100)))
  }

  return (
    <div
      ref={ref}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', cursor: 'ew-resize', userSelect: 'none' }}
      onMouseMove={e => { if (dragging) move(e.clientX) }}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onTouchMove={e => move(e.touches[0].clientX)}
      onTouchEnd={() => setDragging(false)}
    >
      <Image src={before} alt="Antes de Nordico" fill sizes="50vw" style={{ objectFit: 'cover' }} priority />
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${position}%)` }}>
        <Image src={after} alt="Después con Nordico" fill sizes="50vw" style={{ objectFit: 'cover' }} priority />
      </div>
      <div style={{ position: 'absolute', top: '20px', left: '20px', fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(14,14,14,0.65)', backdropFilter: 'blur(4px)', padding: '5px 12px' }}>ANTES</div>
      <div style={{ position: 'absolute', top: '20px', right: '20px', fontFamily: 'var(--font-display)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--orange)', border: '1px solid rgba(232,82,26,0.5)', background: 'rgba(14,14,14,0.65)', backdropFilter: 'blur(4px)', padding: '5px 12px' }}>DESPUÉS</div>
      <div
        style={{ position: 'absolute', top: 0, bottom: 0, left: `${position}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}
        onMouseDown={e => { e.preventDefault(); setDragging(true) }}
        onTouchStart={() => setDragging(true)}
      >
        <div style={{ width: '2px', height: '100%', background: 'rgba(255,255,255,0.6)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: '44px', height: '44px', background: 'var(--orange)', border: '2px solid rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'ew-resize' }}>
          <div style={{ transform: 'rotate(-45deg)', color: 'white', fontSize: '15px', fontWeight: 700, lineHeight: 1 }}>↔</div>
        </div>
      </div>
    </div>
  )
}

function CardSlider({ images, alt, onImageClick }: { images: string[]; alt: string; onImageClick?: (index: number) => void }) {
  const [index, setIndex] = useState(0)
  const goTo = (i: number) => setIndex((i + images.length) % images.length)

  return (
    <div className="card-slider" onClick={() => onImageClick?.(index)} style={{ cursor: onImageClick ? 'zoom-in' : undefined }}>
      <div className="card-slider-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {images.map((src, i) => (
          <Image
            key={i}
            src={src}
            alt={alt}
            width={600}
            height={450}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button className="card-slider-btn prev" aria-label="Anterior" onClick={e => { e.stopPropagation(); goTo(index - 1) }}>‹</button>
          <button className="card-slider-btn next" aria-label="Siguiente" onClick={e => { e.stopPropagation(); goTo(index + 1) }}>›</button>
        </>
      )}
      <div className="card-slider-dots">
        {images.map((_, i) => (
          <span key={i} className={i === index ? 'active' : ''} onClick={e => { e.stopPropagation(); goTo(i) }} />
        ))}
      </div>
    </div>
  )
}

function renderName(name: string) {
  const match = name.match(/^(.*?)(\d+X\d+)$/)
  if (!match) return <>{name}</>
  return <>{match[1]}<span style={{ textDecoration: 'underline', textDecorationColor: 'var(--orange)', textUnderlineOffset: '3px' }}>{match[2]}</span></>
}

export default function ProductosClient() {
  const products = useProducts()
  const baldosas = useBaldosas()
  const [lightbox, setLightbox] = useState<{ images: string[]; alt: string; index: number } | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Record<string, number>>({})

  return (
    <div id="catalogo">

      {/* Hero — sin imagen */}
      <div className="hero">
        <div className="hero-content" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Rombos concéntricos decorativos — fondo */}
          <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 0 }}>
            <div style={{ width: '340px', height: '340px', border: '1px solid rgba(232,82,26,0.1)', transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '240px', height: '240px', border: '1px solid rgba(232,82,26,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '120px', height: '120px', border: '1px solid rgba(232,82,26,0.1)', background: 'rgba(232,82,26,0.03)' }} />
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="hero-tag fade-up">{'// SOLUCIONES TÉRMICAS'}</div>
            <h1 className="hero-title fade-up-2">
              Colecciones<br />de Losetas<br /><span>Nordico</span>
            </h1>
            <div className="fade-up-3" style={{ width: '48px', height: '2px', background: 'var(--orange)', marginBottom: '28px' }} />
            <p className="hero-body fade-up-3">
              Tecnología atérmica que mantiene tus superficies frescas, incluso bajo el sol más intenso.
            </p>
            <div className="fade-up-4" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {['100% Atérmico', 'Antideslizante', 'Resistente al cloro'].map(f => (
                <span key={f} className="hero-feature-tag">{f}</span>
              ))}
            </div>
            <div className="hero-actions fade-up-4">
              <a className="btn-primary" href="#catalogo-grid">VER MUESTRAS</a>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <BeforeAfterSlider before="/img/Antes.png" after="/img/Despues.png" />
        </div>
      </div>

      <SectionDivider />

      {/* Catálogo: Losetas Atérmicas */}
      <div className="catalog-header" id="catalogo-grid">
        <div>
          <div className="section-eyebrow">// Losetas Atérmicas</div>
          <div className="catalog-header-title">CATÁLOGO DE LOSETAS</div>
          <div style={{ marginTop: '12px', fontSize: '12px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 500 }}>
            * Imágenes de carácter ilustrativo
          </div>
        </div>
      </div>
      <div className="products-grid">
        {products.map(product => (
          <div className="product-card" key={product.key} data-product-key={product.key}>
            <div className="product-thumb">
              <CardSlider images={product.images} alt={product.name} onImageClick={i => setLightbox({ images: product.images, alt: product.name, index: i })} />
            </div>
            <div className="product-info">
              <div className="product-name">{renderName(product.name)}</div>
              <div className="product-meta">
                <div className="product-price">${product.priceUnit.toLocaleString('es-AR')} <span>c/u</span></div>
                {product.tag && <div className="tag-pill">{product.tag}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionDivider />

      {/* Catálogo: Baldosas */}
      <div className="catalog-header">
        <div>
          <div className="section-eyebrow">// Baldosas</div>
          <div className="catalog-header-title">CATÁLOGO DE BALDOSAS</div>

          <div style={{ marginTop: '12px', fontSize: '12px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 500 }}>
            * Imágenes de carácter ilustrativo
          </div>
        </div>
      </div>
      {baldosas.length > 0 ? (
        <div className="products-grid">
          {baldosas.map(product => {
            const selectedIdx = selectedVariant[product.key] // undefined = sin selección, muestra imagen base
            const currentVariant = selectedIdx !== undefined ? product.variants?.[selectedIdx] : null
            const displayImages = currentVariant?.images?.length ? currentVariant.images : product.images
            return (
              <div className="product-card" key={product.key} data-product-key={product.key}>
                <div className="product-thumb">
                  <CardSlider images={displayImages} alt={product.name} onImageClick={i => setLightbox({ images: displayImages, alt: product.name, index: i })} />
                </div>
                {product.variants && product.variants.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', padding: '10px 16px 4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        title={v.name}
                        onClick={e => { e.stopPropagation(); setSelectedVariant(prev => { if (prev[product.key] === i) { const next = { ...prev }; delete next[product.key]; return next } return { ...prev, [product.key]: i } }) }}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: v.color,
                          border: selectedIdx === i ? '2px solid #E8521A' : '2px solid transparent',
                          outline: '2px solid rgba(255,255,255,0.15)',
                          outlineOffset: '1px',
                          cursor: 'pointer',
                          flexShrink: 0,
                          transition: 'border-color 0.15s, transform 0.15s',
                          transform: selectedIdx === i ? 'scale(1.18)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                )}
                <div className="product-info">
                  <div className="product-name">{renderName(product.name)}</div>
                  <div className="product-meta">
                    {currentVariant?.price ? (
                      <div className="product-price">
                        ${product.priceUnit.toLocaleString('es-AR')}
                        <span className="price-additional" style={{ color: 'var(--orange)', fontWeight: 600 }}> + ${currentVariant.price.toLocaleString('es-AR')}</span> <span>m2</span>
                      </div>
                    ) : (
                      <div className="product-price">${product.priceUnit.toLocaleString('es-AR')} <span>m2</span></div>
                    )}
                    {product.tag && <div className="tag-pill">{product.tag}</div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="catalog-coming-soon">
          <div className="coming-soon-badge">En desarrollo</div>
          <div className="coming-soon-title">PRÓXIMAMENTE</div>
          <div className="coming-soon-text">Estamos preparando nuestra línea de baldosas. Pronto vas a poder ver todos los modelos disponibles.</div>
        </div>
      )}

      <SectionDivider />

      {/* Catálogo: Revestimientos */}
      <div className="catalog-header">
        <div>
          <div className="section-eyebrow">// Revestimientos</div>
          <div className="catalog-header-title">CATÁLOGO DE REVESTIMIENTOS</div>

        </div>
      </div>
      <div className="catalog-coming-soon">
        <div className="coming-soon-badge">En desarrollo</div>
        <div className="coming-soon-title">PRÓXIMAMENTE</div>
        <div className="coming-soon-text">Estamos preparando nuestra línea de revestimientos. Pronto vas a poder ver todos los modelos disponibles.</div>
      </div>

      <Footer />

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
