'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useProducts } from '@/hooks/useProducts'
import { useBaldosas } from '@/hooks/useBaldosas'
import Footer from '@/components/Footer'
import SectionDivider from '@/components/SectionDivider'
import Lightbox from '@/components/Lightbox'

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

  return (
    <div id="catalogo">

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-tag fade-up">// SOLUCIONES TÉRMICAS</div>
          <h1 className="hero-title fade-up-2">
            Colecciones<br />de Losetas<br /><span>Nordico</span>
          </h1>
          <p className="hero-body fade-up-3">
            Nuestra tecnología térmica asegura superficies siempre frescas, incluso bajo el sol más intenso.
          </p>
          <div className="hero-actions fade-up-4">
            <a className="btn-primary" href="#catalogo-grid">VER MUESTRAS</a>
          </div>
        </div>

        <div className="hero-image">
          <div style={{ width: '100%', height: '100%', background: '#141414', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div style={{ position: 'absolute', width: '140%', height: '1px', background: 'rgba(232,82,26,0.15)', top: '50%', left: '-20%', transform: 'rotate(-45deg)' }} />
            <div style={{ position: 'absolute', inset: '6%', background: 'rgba(20,20,20,0.92)', border: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '10px', alignItems: 'center', overflow: 'hidden' }}>
              <Image
                src="/img/Piletas 1.jpg"
                alt="Losetas Nordico colocadas alrededor de piscina"
                width={600}
                height={400}
                className="hero-product-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                priority
              />
              <Image
                src="/img/Piletas 2.jpg"
                alt="Solarium atérmico Nordico en pileta residencial"
                width={600}
                height={400}
                className="hero-product-img-alt"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                priority
              />
            </div>
            <div className="hero-image-overlay">
              <div className="iso-badge">MATERIA PRIMA DE PRIMERA CALIDAD</div>
            </div>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Catálogo: Losetas Atérmicas */}
      <div className="catalog-header" id="catalogo-grid">
        <div>
          <div className="section-eyebrow">// Losetas Atérmicas</div>
          <div className="catalog-header-title">CATÁLOGO DE LOSETAS</div>
          <div className="catalog-header-sub">Modelos diseñados para resistir climas extremos</div>
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
          <div className="catalog-header-sub">Nueva línea de productos</div>
        </div>
      </div>
      {baldosas.length > 0 ? (
        <div className="products-grid">
          {baldosas.map(product => (
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
          <div className="catalog-header-sub">Nueva línea de productos</div>
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
