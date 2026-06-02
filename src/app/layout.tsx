import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import NavWrapper from '@/components/NavWrapper'
import ScrollTopButton from '@/components/ScrollTopButton'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Nordico',
  description: 'Losetas atérmicas de alta calidad para piletas y solarium',
  url: 'https://www.nordico.net.ar',
  telephone: '+5491163716566',
  image: 'https://www.nordico.net.ar/img/logo%20nordico.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Sagrada Familia 610',
    addressLocality: 'Carpintería',
    addressRegion: 'San Luis',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -32.407535665143804,
    longitude: -65.01325109660768,
  },
  priceRange: '$$',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+5491163716566',
    contactType: 'sales',
    availableLanguage: 'Spanish',
  },
}

export const metadata: Metadata = {
  title: {
    default: 'Nordico — Losetas Atérmicas para Piletas',
    template: '%s | Nordico',
  },
  description: 'Losetas atérmicas de alta calidad para piletas. Superficies más frescas, diseño premium y durabilidad extrema. Más de 100 proyectos instalados en Argentina.',
  keywords: ['losetas atérmicas', 'pileta', 'solarium', 'nordico', 'baldosas', 'revestimientos', 'carpintería san luis'],
  verification: {
    google: 'DPSkm22Q0RB6pFvrTuFnmEwzTFv_E36RkXzCT59Wv98',
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Nordico',
    url: 'https://www.nordico.net.ar',
    title: 'Nordico — Losetas Atérmicas para Piletas',
    description: 'Losetas atérmicas de alta calidad para piletas. Superficies frescas, diseño premium y durabilidad extrema.',
    images: [{
      url: 'https://www.nordico.net.ar/img/Piletas%201.jpg',
      width: 1200,
      height: 800,
      alt: 'Losetas Nordico alrededor de piscina',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nordico — Losetas Atérmicas para Piletas',
    description: 'Losetas atérmicas de alta calidad para piletas. Más de 100 proyectos en Argentina.',
    images: ['https://www.nordico.net.ar/img/Piletas%201.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NavWrapper />
        <ScrollTopButton />
        {children}
      </body>
    </html>
  )
}
