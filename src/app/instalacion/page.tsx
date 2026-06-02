import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Guía de Instalación',
  description: 'Guía técnica de instalación de losetas atérmicas Nordico. Proceso en 6 pasos para una colocación perfecta alrededor de piletas y solarium.',
  keywords: ['instalación losetas atérmicas', 'colocación solarium', 'guía instalación pileta', 'paso a paso losetas', 'cómo colocar losetas'],
  alternates: { canonical: 'https://www.nordico.net.ar/instalacion' },
  openGraph: {
    title: 'Instalación de Losetas Nordico — Guía Completa en 6 Pasos',
    description: 'Proceso técnico detallado para instalar correctamente tus losetas atérmicas Nordico. Preparación, adhesivo, colocación y sellado.',
    url: 'https://www.nordico.net.ar/instalacion',
  },
}

const STEPS = [
  { num: '01', title: 'PREPARACIÓN DEL SUSTRATO', body: 'Limpieza profunda y nivelación de la superficie. La base debe ser firme, estable y libre de impurezas.' },
  { num: '02', title: 'APLICACIÓN DE ADHESIVO', body: 'Aplicar adhesivo cementicio para exterior con llana dentada. Cobertura uniforme para máxima adherencia.' },
  { num: '03', title: 'COLOCACIÓN DE LOSETAS', body: 'Ubicar las losetas Nordico alineadas y niveladas. Mantener juntas uniformes para un acabado preciso.' },
  { num: '04', title: 'NIVELACIÓN Y AJUSTE', body: 'Presionar y ajustar cada pieza asegurando correcta nivelación y contacto total con la base.' },
  { num: '05', title: 'SELLADO DE JUNTAS', body: 'Rellenar con pastina apta para exterior. Garantiza impermeabilidad y terminación prolija.' },
  { num: '06', title: 'CURADO Y LIMPIEZA FINAL', body: 'Dejar fraguar 24–48 hs. Limpieza final para una superficie lista y duradera.' },
]

const REASONS = [
  'Máxima seguridad alrededor de la pileta',
  'Debido a los materiales atérmicos que elegimos, nuestras losetas tienen una temperatura agradable',
  'Diseño moderno y elegante',
  'Fácil mantenimiento',
  'Calidad pensada para durar años',
  'Combinación perfecta entre estética y funcionalidad',
  'Productos desarrollados específicamente para zonas húmedas y exteriores.',
  'Ideal para transformar cualquier pileta',
]

export default function Instalacion() {
  return (
    <div id="instalacion">

      {/* Hero */}
      <div className="install-hero">
        <div className="install-hero-text">
          <h1>El Camino a tu<br />Pileta <span style={{ color: 'var(--orange)' }}>Soñada</span></h1>
          <p>Una guía técnica detallada para la correcta colocación de nuestras baldosas atérmicas.</p>
        </div>
        <div className="install-hero-img" style={{ outline: '6px solid rgba(232,82,26,0.15)', outlineOffset: '4px' }}>
          <Image
            src="/img/Capas.png"
            alt="Tecnología en capas de las losetas atérmicas Nordico"
            width={800}
            height={600}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            priority
          />
        </div>
      </div>

      {/* Pasos */}
      <div className="steps-section">
        <h2>// PROCESO DE INSTALACIÓN EN 6 PASOS</h2>
        <div className="steps-grid">
          {STEPS.map(step => (
            <div className="step-card" key={step.num}>
              <div className="step-number">{step.num}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-body">{step.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist */}
      <div className="checklist-card">
        <div>
          <h3>¿POR QUÉ ELEGIRNOS?</h3>
          <div className="sub">// 8 RAZONES ;)</div>
          <ul className="checklist-items">
            {REASONS.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <div>
          <div className="pool-img-frame">
            <Image
              src="/img/Pileta_desde_arriba.png"
              alt="Vista aérea de pileta con losetas atérmicas Nordico instaladas"
              width={600}
              height={600}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            <Link className="btn-primary" href="/presupuesto" style={{ width: '100%', textAlign: 'center', display: 'block' }}>
              SOLICITAR PRESUPUESTO
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
