'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials'
import SectionDivider from '@/components/SectionDivider'
import ImageAutoSlider from '@/components/ui/image-auto-slider'
import { Tiles } from '@/components/ui/tiles'

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

export default function HomeClient() {
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsTriggered, setStatsTriggered] = useState(false)
  const [statValues, setStatValues] = useState([0, 0, 0, 0])
  const [lightboxImg, setLightboxImg] = useState<string | null>(null)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setStatsTriggered(true)
        observer.disconnect()
      }
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!statsTriggered) return
    const targets = [20, 6, 100, 6]
    const duration = 1800
    let startTime: number | null = null

    function step(now: number) {
      if (!startTime) startTime = now
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = easeOutCubic(progress)
      setStatValues(targets.map(t => Math.round(eased * t)))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [statsTriggered])

  return (
    <div id="home">

      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <div className="home-hero-tag fade-up">// Losetas Atérmicas</div>
          <h1 className="home-hero-title fade-up-2">
            Tu Pileta<br />Nunca Tan<br /><span>Fresca</span>
          </h1>
          <p className="home-hero-body fade-up-3">
            Losetas atérmicas de alta calidad. Superficies más frescas,
            diseño premium y durabilidad extrema para proyectos que exigen lo mejor.
          </p>
          <div className="home-hero-actions fade-up-4">
            <Link className="btn-primary" href="/productos#catalogo-grid">VER CATÁLOGO</Link>
            <Link className="btn-outline" href="/presupuesto">PEDIR PRESUPUESTO</Link>
          </div>
        </div>
        <div className="home-hero-badges">
          <div className="home-hero-badge-item">Materia Prima de Primera Calidad</div>
          <div className="home-hero-badge-item">Soluciones Térmicas</div>
        </div>
        <div className="home-hero-scroll">Explorar</div>
      </div>

      {/* Stats */}
      <div className="home-stats" ref={statsRef}>
        <div className="stat-item">
          <div className="stat-number"><em>+</em>{statValues[0]}<em>°C</em></div>
          <div className="stat-label">Diferencias notorias de temperatura entre una loseta atermica Nordico y una convencional</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{statValues[1]}<em>+</em></div>
          <div className="stat-label">Modelos disponibles en losetas atermicas</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{statValues[2]}<em>+</em></div>
          <div className="stat-label">Proyectos instalados</div>
        </div>
        <div className="stat-item">
          <div className="stat-number"><em>+</em>{statValues[3]}<em> AÑOS</em></div>
          <div className="stat-label">NUESTRA EXPERIENCIA ASEGURA TU CALIDAD</div>
        </div>
      </div>

      <SectionDivider />

      {/* Features */}
      <div className="home-features">
        <div className="section-eyebrow">// Por qué Nordico</div>
        <div className="section-title">Tecnología<br />que se siente.</div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">❄</div>
            <div className="feature-title">Tecnología Térmica</div>
            <div className="feature-body">Material atérmico de última generación. Superficies que permanecen frescas incluso bajo el sol más intenso del verano.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">◈</div>
            <div className="feature-title">Diseño Premium</div>
            <div className="feature-body">Estética moderna y versátil. Cada modelo está pensado para complementar arquitecturas de alta gama y proyectos exigentes.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⬡</div>
            <div className="feature-title">Alta Durabilidad</div>
            <div className="feature-body">Resistentes a rayos UV, humedad y climas extremos. Construidas para durar años sin perder rendimiento ni color.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✦</div>
            <div className="feature-title">Instalación Simple</div>
            <div className="feature-body">Sistema de colocación pensado para agilizar la obra. Guía técnica detallada incluida con cada pedido.</div>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* Productos destacados */}
      <div className="home-products">
        <div className="home-products-header">
          <div>
            <div className="section-eyebrow">// Nuestros Modelos</div>
            <div className="section-title" style={{ fontSize: 'clamp(30px,3.5vw,48px)', marginBottom: 0 }}>
              NUESTRA <span style={{ color: 'var(--orange)' }}>COLECCION</span>
            </div>
          </div>
          <Link className="btn-outline" href="/productos#catalogo-grid">Ver catálogo completo</Link>
        </div>

        <div className="home-products-showcase">
          <Link className="showcase-featured" href="/productos#catalogo-grid" style={{ position: 'relative', overflow: 'hidden' }}>
            <Image
              src="/img/Solarium Cartoon.png"
              alt="Loseta Solarium 50x50 atérmica para pileta — modelo más popular"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center' }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="showcase-featured-overlay">
              <div className="showcase-tag">MÁS POPULAR</div>
              <div className="showcase-name">LOSETAS ATERMICAS</div>
              <div className="showcase-cta">Ver colección</div>
            </div>
          </Link>
          <Link className="showcase-featured" href="/productos#catalogo-grid" style={{ position: 'relative', overflow: 'hidden' }}>
            <Image
              src="/img/Baldosa Cartoon.png"
              alt="Baldosa exterior Nordico para solarium y pileta"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center' }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="showcase-featured-overlay">
              <div className="showcase-name">BALDOSAS</div>
              <div className="showcase-cta">Ver colección</div>
            </div>
          </Link>
          <Link className="showcase-featured" href="/productos#catalogo-grid" style={{ position: 'relative', overflow: 'hidden' }}>
            <Image
              src="/img/Revestimiento Cartoon.png"
              alt="Revestimiento exterior Nordico para paredes de pileta"
              fill
              style={{ objectFit: 'contain', objectPosition: 'center' }}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="showcase-featured-overlay">
              <div className="showcase-name">REVESTIMIENTOS</div>
              <div className="showcase-cta">Ver colección</div>
            </div>
          </Link>
        </div>
      </div>

      <SectionDivider />

      {/* Reviews */}
      <div className="home-reviews">
        <div className="home-reviews-header">
          <div className="section-eyebrow">// Lo que dicen nuestros clientes</div>
          <div className="section-title" style={{ fontSize: 'clamp(30px,3.5vw,48px)', marginBottom: 0 }}>
            Opiniones en <span style={{ color: 'var(--orange)' }}>Google</span>
          </div>
        </div>
        <StaggerTestimonials />
      </div>

      <SectionDivider />

      {/* Slider automático de trabajos */}
      <div className="home-interactive-selector">
        <div style={{ marginBottom: '40px' }}>
          <div className="section-eyebrow">// Proyectos destacados</div>
          <div className="section-title" style={{ marginBottom: 0 }}>
            CONOCÉ NUESTROS <span style={{ color: 'var(--orange)' }}>TRABAJOS</span>
          </div>
        </div>
        <ImageAutoSlider />
      </div>

      <SectionDivider />

      {/* Ubicación */}
      <div className="home-map-section">
        <div style={{ marginBottom: '32px' }}>
          <div className="section-eyebrow">// Dónde encontrarnos</div>
          <div className="section-title" style={{ marginBottom: 0 }}>
            NUESTRA <span style={{ color: 'var(--orange)' }}>UBICACIÓN</span>
          </div>
        </div>
        <div style={{ border: '1px solid var(--orange)', outline: '4px solid rgba(232,82,26,0.10)', outlineOffset: '3px', overflow: 'hidden', lineHeight: 0 }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1944.9351919409842!2d-65.01325109660768!3d-32.407535665143804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2e374b60b26ff%3A0x891caa300994e1f2!2sAtermicos%20y%20Baldosas%20Nordico!5e1!3m2!1ses-419!2sar!4v1779069111688!5m2!1ses-419!2sar"
            width="100%" height="700" className="home-map-iframe"
            style={{ border: 0, display: 'block', filter: 'grayscale(10%) contrast(1.1) brightness(0.75)' }}
            allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación Nordico"
          />
        </div>
        <div style={{ padding: '12px 16px', background: 'var(--dark2)', border: '1px solid var(--border-line)', borderTop: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--orange)', fontSize: '20px' }}>📍</span>
          <span style={{ fontSize: '14px', color: 'var(--gray)' }}>Sagrada Familia 610 — Carpinteria, San Luis, Argentina</span>
        </div>
      </div>

      <SectionDivider />

      {/* CTA */}
      <div className="home-cta">
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Tiles rows={60} cols={12} tileSize="md" />
        </div>
        <div className="home-cta-content">
          <div className="home-cta-title">¿Listo para<br />Transformar<br />tu <span>Pileta?</span></div>
          <div className="home-cta-sub">Pedí tu presupuesto sin compromiso. Te asesoramos en la elección del modelo ideal para tu proyecto.</div>
        </div>
        <div className="home-cta-actions">
          <Link className="btn-primary" href="/presupuesto" style={{ fontSize: '18px', padding: '16px 36px' }}>SOLICITAR PRESUPUESTO</Link>
        </div>
      </div>

      <Footer />

      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)} onKeyDown={e => e.key === 'Escape' && setLightboxImg(null)} tabIndex={-1}>
          <img src={lightboxImg} className="lightbox-img" alt="Pileta instalada con losetas atérmicas Nordico" onClick={e => e.stopPropagation()} />
          <button className="lightbox-close" onClick={() => setLightboxImg(null)} aria-label="Cerrar">✕</button>
        </div>
      )}
    </div>
  )
}
