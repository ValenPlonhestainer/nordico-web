import type { Metadata } from 'next'
import PresupuestoClient from '@/components/PresupuestoClient'

export const metadata: Metadata = {
  title: 'Solicitar Presupuesto',
  description: 'Calculá el costo de tus losetas atérmicas Nordico. Seleccioná el modelo, la cantidad y recibí tu presupuesto personalizado por WhatsApp.',
  keywords: ['presupuesto losetas', 'cotización pileta', 'precio solarium atérmico', 'comprar losetas atérmicas', 'cotizar nordico'],
  alternates: { canonical: 'https://www.nordico.net.ar/presupuesto' },
  openGraph: {
    title: 'Presupuesto de Losetas Atérmicas Nordico',
    description: 'Calculá el costo de tus losetas en segundos. Elegí el modelo y la cantidad, y recibí tu presupuesto por WhatsApp.',
    url: 'https://www.nordico.net.ar/presupuesto',
  },
}

export default function Presupuesto() {
  return <PresupuestoClient />
}
