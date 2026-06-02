'use client'
import { usePathname } from 'next/navigation'
import PillNav from './PillNav'

const NAV_ITEMS = [
  { label: 'Inicio',      href: '/' },
  { label: 'Productos',   href: '/productos#catalogo-grid' },
  { label: 'Instalación', href: '/instalacion' },
  { label: 'Presupuesto', href: '/presupuesto' },
]

export default function NavWrapper() {
  const pathname = usePathname()
  return (
    <PillNav
      logo="/img/icon.png"
      logoAlt="Nordico"
      items={NAV_ITEMS}
      activeHref={pathname}
      baseColor="#C44010"
      pillColor="#141414"
      pillTextColor="#F5F4F0"
      hoveredPillTextColor="#F5F4F0"
      initialLoadAnimation={true}
    />
  )
}
