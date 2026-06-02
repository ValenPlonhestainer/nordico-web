import type { Metadata } from 'next'
import ProductosClient from '@/components/ProductosClient'

export const metadata: Metadata = {
  title: 'Catálogo de Losetas Atérmicas',
  description: 'Catálogo completo de losetas atérmicas Nordico. 6 modelos: Solarium 50x50, Borde L, Borde Ballena, Esquina y más. Ver precios y especificaciones técnicas.',
  keywords: ['catálogo losetas', 'losetas atérmicas precios', 'solarium 50x50', 'borde pileta', 'loseta antideslizante', 'nordico precios'],
  alternates: { canonical: 'https://www.nordico.net.ar/productos' },
  openGraph: {
    title: 'Catálogo de Losetas Nordico — Precios y Modelos',
    description: '6 modelos de losetas atérmicas para piletas. Solarium 50x50, Borde L, Borde Ballena, Esquina. Precios desde $6.000.',
    url: 'https://www.nordico.net.ar/productos',
    images: [{
      url: 'https://www.nordico.net.ar/img/Piletas%201.jpg',
      width: 1200,
      height: 800,
      alt: 'Losetas Nordico alrededor de piscina',
    }],
  },
}

export default function Productos() {
  return <ProductosClient />
}
