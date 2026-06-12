import type { Metadata } from 'next'
import CalculadoraClient from '@/components/calculadora/CalculadoraClient'

export const metadata: Metadata = {
  title: 'Calculadora de Losetas para Piletas',
  description: 'Calculá cuántas losetas atérmicas necesitás para tu pileta: ingresá la forma y las medidas, agregá solariums en el plano interactivo y obtené la lista de piezas con precio estimado.',
  keywords: ['calculadora losetas pileta', 'cuántas losetas necesito', 'calcular bordes atérmicos', 'losetas atérmicas calculadora', 'presupuesto pileta nordico'],
  alternates: { canonical: 'https://www.nordico.net.ar/calculadora' },
  openGraph: {
    title: 'Calculadora de Losetas para Piletas | Nordico',
    description: 'Ingresá las medidas de tu pileta y calculá cuántas losetas atérmicas necesitás, con plano interactivo y precio estimado.',
    url: 'https://www.nordico.net.ar/calculadora',
  },
}

export default function Calculadora() {
  return <CalculadoraClient />
}
