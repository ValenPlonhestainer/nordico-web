'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials'
import Masonry from '@/components/ui/Masonry'
import SectionDivider from '@/components/SectionDivider'

const GALLERY_ITEMS = [
  { id: '1',  img: '/img/Pileta%20Cliente%201.JPG',  height: 400 },
  { id: '2',  img: '/img/Pileta%20Cliente%202.JPG',  height: 550 },
  { id: '3',  img: '/img/Pileta%20Cliente%203.JPG',  height: 500 },
  { id: '4',  img: '/img/Pileta%20Cliente%204.JPG',  height: 350 },
  { id: '5',  img: '/img/Pileta%20Cliente%205.JPG',  height: 600 },
  { id: '6',  img: '/img/Pileta%20Cliente%206.JPG',  height: 400 },
  { id: '7',  img: '/img/Pileta%20Cliente%207.JPG',  height: 500 },
  { id: '8',  img: '/img/Pileta%20Cliente%208.JPG',  height: 450 },
  { id: '9',  img: '/img/Pileta%20Cliente%209.JPG',  height: 550 },
  { id: '10', img: '/img/Pileta%20Cliente%2010.jpg', height: 400 },
  { id: '11', img: '/img/Pileta%20Cliente%2011.JPG', height: 500 },
]

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }

export default function HomeClient() {
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsTriggered, setStatsTriggered] = useState(false)
  const [statValues, setStatValues] = useState([0, 0, 0, 0])
  const [galleryIdx, setGalleryIdx] = useState(0)
  const galleryHoverRef = useRef(false)
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

  useEffect(() => {
    const timer = setInterval(() => {
      if (!galleryHoverRef.current)
        setGalleryIdx(i => (i + 1) % GALLERY_ITEMS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

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

      {/* Galería */}
      <div className="home-gallery-section">
        <div style={{ marginBottom: '40px' }}>
          <div className="section-eyebrow">// Galería de trabajos</div>
          <div className="section-title" style={{ marginBottom: 0 }}>
            TRABAJOS <span style={{ color: 'var(--orange)' }}>REALIZADOS</span>
          </div>
        </div>
        <div className="home-gallery-masonry">
          <Masonry
            items={GALLERY_ITEMS}
            ease="power3.out"
            duration={0.6}
            stagger={0.05}
            animateFrom="bottom"
            scaleOnHover={true}
            hoverScale={0.97}
            blurToFocus={true}
            colorShiftOnHover={false}
            onItemClick={(item: { img: string }) => setLightboxImg(item.img)}
          />
        </div>
        <div
          className="home-gallery-slider"
          onMouseEnter={() => { galleryHoverRef.current = true }}
          onMouseLeave={() => { galleryHoverRef.current = false }}
        >
          <div className="hg-slider-viewport">
            <div className="hg-slider-track" style={{ transform: `translateX(-${galleryIdx * 100}%)` }}>
              {GALLERY_ITEMS.map((item, i) => (
                <div key={i} className="hg-slide">
                  <Image
                    src={item.img}
                    alt={`Pileta instalada con losetas atérmicas Nordico — trabajo ${i + 1}`}
                    width={1200}
                    height={800}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              ))}
            </div>
            <div className="hg-slider-overlay">
              <div className="hg-counter">
                <span>{String(galleryIdx + 1).padStart(2, '0')}</span>
                {' / '}
                {String(GALLERY_ITEMS.length).padStart(2, '0')}
              </div>
              <div className="hg-nav">
                <button className="hg-nav-btn" onClick={() => setGalleryIdx(i => (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)}>‹</button>
                <button className="hg-nav-btn" onClick={() => setGalleryIdx(i => (i + 1) % GALLERY_ITEMS.length)}>›</button>
              </div>
            </div>
          </div>
          <div className="hg-dots">
            {GALLERY_ITEMS.map((_, i) => (
              <span key={i} className={i === galleryIdx ? 'active' : ''} onClick={() => setGalleryIdx(i)} />
            ))}
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* CTA */}
      <div className="home-cta">
        <div className="home-cta-bg" />
        <div className="home-cta-content">
          <div className="home-cta-title">¿Listo para<br />Transformar<br />tu <span>Pileta?</span></div>
          <div className="home-cta-sub">Pedí tu presupuesto sin compromiso. Te asesoramos en la elección del modelo ideal para tu proyecto.</div>
        </div>
        <div className="home-cta-actions">
          <Link className="btn-primary" href="/presupuesto">SOLICITAR PRESUPUESTO</Link>
          <Link className="btn-outline" href="/instalacion">VER GUÍA DE INSTALACIÓN</Link>
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
