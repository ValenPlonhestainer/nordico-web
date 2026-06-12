import type { Metadata } from 'next'
import HomeClient from '@/components/HomeClient'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.nordico.net.ar' },
  openGraph: {
    title: 'Nordico — Losetas Atérmicas para Piletas',
    description: 'Losetas atérmicas de alta calidad para piletas. Superficies más frescas, diseño premium y durabilidad extrema. Más de 100 proyectos instalados en Argentina.',
    url: 'https://www.nordico.net.ar',
    images: [{
      url: 'https://www.nordico.net.ar/img/og-nordico.png',
      width: 1200,
      height: 630,
      alt: 'Nordico — Losetas Atérmicas para Piletas',
    }],
  },
}

export default function Home() {
  return <HomeClient />
}
