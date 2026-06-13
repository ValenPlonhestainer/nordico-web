'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/config/products'
import Footer from '@/components/Footer'

const WHATSAPP = '5491163716566'

function getMedidas(name: string): string | null {
  const match = name.match(/(\d+)[Xx](\d+)/)
  if (!match) return null
  return `${parseInt(match[1]) / 100}m x ${parseInt(match[2]) / 100}m`
}

function getDescription(product: Product, isBaldosa: boolean): string {
  const n = product.name.toLowerCase()
  if (isBaldosa) return `${product.name} disponible en múltiples colores y terminaciones. Alta resistencia al tráfico, fácil limpieza y durabilidad garantizada para interiores y exteriores.`
  if (n.includes('solarium')) return `Loseta Solarium atérmica ideal para cubiertas de piletas y soláriums. No levanta temperatura al sol, es antideslizante y resistente, logrando una terminación moderna, segura y duradera en exteriores.`
  if (n.includes('borde') || n.includes('bord')) return `${product.name} atérmico ideal para bordes de piscina. No levanta temperatura al sol, es antideslizante y resistente, logrando una terminación moderna, segura y duradera en exteriores.`
  if (n.includes('esquina')) return `Pieza de esquina atérmica para complementar los bordes de tu piscina. No levanta temperatura al sol, fácil instalación y durabilidad garantizada para espacios exteriores.`
  return `${product.name} de la línea atérmica Nordico. Material que no levanta temperatura al sol, antideslizante y resistente al cloro y a las condiciones climáticas.`
}

function renderName(name: string) {
  const match = name.match(/^(.*?)(\d+[xX]\d+|\d+[mM][tT][sS])(.*)$/)
  if (!match) return <>{name}</>
  const isMts = /\d+[mM][tT][sS]/.test(match[2])
  const isRomano = name.toUpperCase().includes('ROMANO')
  const prefix = isMts && isRomano ? 'DIÁMETRO ' : ''
  return <>{match[1]}{prefix}<span style={{ textDecoration: 'underline', textDecorationColor: 'var(--orange)', textUnderlineOffset: '4px' }}>{match[2]}</span>{match[3]}</>
}

export default function ProductDetailClient({
  product,
  related,
  isBaldosa,
}: {
  product: Product
  related: Product[]
  isBaldosa: boolean
}) {
  const [mainImg, setMainImg] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'desc' | 'info'>('desc')

  const displayImages =
    selectedVariant !== null && product.variants?.[selectedVariant]?.images?.length
      ? product.variants[selectedVariant].images
      : product.images

  const currentVariant = selectedVariant !== null ? product.variants?.[selectedVariant] : null
  const price = currentVariant?.price ? product.priceUnit + currentVariant.price : product.priceUnit
  const medidas = getMedidas(product.name)
  const description = getDescription(product, isBaldosa)
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, me interesa el producto ${product.name}. ¿Podrían darme más información?`)}`

  const features = isBaldosa
    ? ['Disponible en múltiples colores y terminaciones', 'Antideslizante ideal para zonas húmedas', 'Alta resistencia al tráfico', 'Fácil limpieza y mantenimiento', 'Apto para interiores y exteriores']
    : ['Material atérmico: no levanta temperatura al sol', 'Antideslizante ideal para zonas húmedas', 'Alta resistencia al uso exterior', 'Fácil limpieza y mantenimiento', 'Disponible en distintos colores y medidas']

  const usos = isBaldosa
    ? ['Interiores y exteriores', 'Pasillos y espacios de alto tráfico']
    : ['Bordes y perímetros de piscina', 'Solárium y zonas de descanso', 'Patios y espacios exteriores']

  const specs: [string, string][] = [
    ['Código', product.key.toUpperCase()],
    ...(medidas ? [['Medidas', medidas] as [string, string]] : []),
    ['Material', 'Hormigón atérmico'],
    ['Acabado', 'Antideslizante'],
    ['Uso', isBaldosa ? 'Exterior / Interior' : 'Exterior'],
    ['Resistencia', 'Cloro, UV, intemperie'],
  ]

  return (
    <div style={{ paddingTop: '60px', background: 'var(--black)', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ padding: '14px 40px', borderBottom: '1px solid var(--border-line)', background: 'var(--dark)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: 'var(--gray)', letterSpacing: '0.05em', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--gray)', textDecoration: 'none', transition: 'color 0.15s' }}>Inicio</Link>
          <span>/</span>
          <Link href="/productos" style={{ color: 'var(--gray)', textDecoration: 'none', transition: 'color 0.15s' }}>Productos</Link>
          <span>/</span>
          <span style={{ color: 'var(--white)' }}>{product.name}</span>
        </div>
      </div>

      {/* Main layout — dos columnas en desktop, una en mobile */}
      <div className="pd-main-layout">

        {/* Galería */}
        <div>
          <div style={{ position: 'relative', background: 'var(--dark2)', border: '1px solid var(--border-line)', aspectRatio: '1 / 1', overflow: 'hidden', marginBottom: '10px' }}>
            {displayImages[mainImg] ? (
              <Image
                src={displayImages[mainImg]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'contain', padding: '24px' }}
                priority
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)', fontSize: '13px' }}>Sin imagen</div>
            )}
          </div>
          {displayImages.length > 1 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {displayImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setMainImg(i)}
                  style={{
                    width: '76px', height: '76px', flexShrink: 0,
                    position: 'relative', background: 'var(--dark2)',
                    border: `2px solid ${i === mainImg ? 'var(--orange)' : 'var(--border-line)'}`,
                    cursor: 'pointer', padding: '4px',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <Image src={src} alt={`${product.name} ${i + 1}`} fill style={{ objectFit: 'contain', padding: '4px' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Banner calculadora — solo para losetas, no baldosas */}
          {!isBaldosa && <div style={{ background: 'var(--dark2)', border: '1px solid var(--border-line)', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', minWidth: 0 }}>
              <span style={{ fontSize: '26px', flexShrink: 0 }}>📐</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: 'var(--orange)', textTransform: 'uppercase', marginBottom: '4px' }}>ANTES DE COMPRAR</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--white)', marginBottom: '5px', lineHeight: 1.3 }}>¿No sabés cuántas piezas necesitás?</div>
                <div style={{ fontSize: '14px', color: 'var(--gray-light)', lineHeight: 1.5 }}>Ingresá la forma y medidas de tu pileta y te decimos exactamente cuántas comprar.</div>
              </div>
            </div>
            <Link
              href="/calculadora"
              className="btn-primary"
              style={{ fontSize: '13px', padding: '12px 18px', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              CALCULAR →
            </Link>
          </div>}

          {/* Banner WhatsApp */}
          <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>💬</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', color: '#25D366', textTransform: 'uppercase', marginBottom: '4px' }}>CONSULTA RÁPIDA</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--white)', marginBottom: '3px' }}>¿Te interesa este producto?</div>
                <div style={{ fontSize: '14px', color: 'var(--gray-light)' }}>Escribinos por WhatsApp y te respondemos al toque</div>
              </div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#25D366', color: '#fff', padding: '12px 18px', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, transition: 'background 0.2s' }}
            >
              WHATSAPP →
            </a>
          </div>

          {/* Nombre y descripción */}
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--white)', lineHeight: 1.1, marginBottom: '14px' }}>
              {renderName(product.name)}
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--gray-light)', lineHeight: 1.7, marginBottom: '16px' }}>{description}</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <li style={{ fontSize: '15px', color: 'var(--gray-light)', display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--orange)' }}>•</span>
                <span><strong style={{ color: 'var(--white)' }}>Código:</strong> {product.key.toUpperCase()}</span>
              </li>
              {medidas && (
                <li style={{ fontSize: '15px', color: 'var(--gray-light)', display: 'flex', gap: '8px' }}>
                  <span style={{ color: 'var(--orange)' }}>•</span>
                  <span><strong style={{ color: 'var(--white)' }}>Medidas:</strong> {medidas}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Precio */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '48px', fontWeight: 800, color: 'var(--white)', lineHeight: 1 }}>
              ${price.toLocaleString('es-AR')}
            </span>
            <span style={{ fontSize: '16px', color: 'var(--gray)', letterSpacing: '0.05em' }}>
              {isBaldosa ? 'm²' : 'c/u'}
            </span>
            {product.tag && (
              <span style={{ marginLeft: '4px', background: 'var(--orange)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', padding: '4px 12px', textTransform: 'uppercase' }}>
                {product.tag}
              </span>
            )}
          </div>

          {/* Variantes de color */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--gray)', textTransform: 'uppercase', marginBottom: '12px' }}>
                Color{selectedVariant !== null ? `: ${product.variants[selectedVariant].name}` : ''}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    title={v.name}
                    onClick={() => { setSelectedVariant(selectedVariant === i ? null : i); setMainImg(0) }}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: v.color,
                      border: `2px solid ${selectedVariant === i ? 'var(--orange)' : 'transparent'}`,
                      outline: '2px solid rgba(255,255,255,0.15)',
                      outlineOffset: '1px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, transform 0.15s',
                      transform: selectedVariant === i ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Imagen CAD — solo para Bordes Romanos */}
      {product.name.toUpperCase().includes('ROMANO') && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 32px' }}>
          <Image
            src="/img/Borde Romano diseño CAD.png"
            alt="Diseño técnico Borde Romano"
            width={1200}
            height={600}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}

      {/* Tabs */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 60px' }}>
        <div style={{ borderBottom: '1px solid var(--border-line)', display: 'flex', marginBottom: '32px' }}>
          {(['desc', 'info'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '14px 24px',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--orange)' : 'transparent'}`,
                color: activeTab === tab ? 'var(--white)' : 'var(--gray)',
                fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'color 0.2s', marginBottom: '-1px',
              }}
            >
              {tab === 'desc' ? 'Descripción' : 'Información adicional'}
            </button>
          ))}
        </div>

        {activeTab === 'desc' && (
          <div style={{ maxWidth: '760px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: '14px' }}>
              🏗 {product.name}
            </h2>
            <p style={{ color: 'var(--gray-light)', fontSize: '15px', lineHeight: 1.75, marginBottom: '28px' }}>{description}</p>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '14px' }}>
              ✦ Características principales
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '28px' }}>
              {features.map(f => (
                <li key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--gray-light)' }}>
                  <span style={{ color: 'var(--orange)', marginTop: '3px', flexShrink: 0 }}>•</span>
                  {f}
                </li>
              ))}
            </ul>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--orange)', marginBottom: '14px' }}>
              ▲ Usos recomendados
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {usos.map(u => (
                <li key={u} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px', color: 'var(--gray-light)' }}>
                  <span style={{ color: 'var(--orange)', marginTop: '3px', flexShrink: 0 }}>•</span>
                  {u}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'info' && (
          <div style={{ maxWidth: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <tbody>
                {specs.map(([label, value], i) => (
                  <tr key={label} style={{ borderBottom: '1px solid var(--border-line)', background: i % 2 === 0 ? 'var(--dark2)' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--gray)', fontWeight: 600, width: '40%' }}>{label}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--white)' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productos relacionados */}
      {related.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-line)', background: 'var(--dark)', padding: '60px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-eyebrow" style={{ marginBottom: '8px' }}>// También te puede interesar</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: '32px' }}>
              PRODUCTOS RELACIONADOS
            </div>
            <div className="pd-related-grid">
              {related.map(p => (
                <Link key={p.key} href={`/productos/${p.key}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: 'var(--dark2)', border: '1px solid var(--border-line)', transition: 'border-color 0.2s', height: '100%' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(232,82,26,0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-line)')}
                  >
                    <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--dark3)' }}>
                      {p.images[0] && (
                        <Image src={p.images[0]} alt={p.name} fill sizes="25vw" style={{ objectFit: 'contain', padding: '16px' }} />
                      )}
                      {p.tag && (
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--orange)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', padding: '2px 8px', textTransform: 'uppercase' }}>
                          {p.tag}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--white)', marginBottom: '6px', lineHeight: 1.2 }}>
                        {renderName(p.name)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--orange)' }}>
                        ${p.priceUnit.toLocaleString('es-AR')} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--gray)' }}>c/u</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
