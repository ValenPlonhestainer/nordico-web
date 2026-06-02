export interface Product {
  key: string
  name: string
  priceUnit: number
  images: string[]
  tag?: string
}

export interface Service {
  id: string
  label: string
  price: number
  type: 'unit' | 'fixed'
  priceLabel: string
}

export const CATALOG_PRODUCTS: Product[] = [
  { key: 'solarium',    name: 'SOLARIUM 50x50',            priceUnit: 7900, images: ['/img/Solarium Frente.png', '/img/Solarium Perfil.png'], tag: 'MÁS POPULAR' },
  { key: 'recto',       name: 'BORDE L 50x50',             priceUnit: 9800, images: ['/img/Borde L Frente.png', '/img/Borde L Perfil.png'] },
  { key: 'ballena5050', name: 'BORDE BALLENA 50X50', priceUnit: 9800, images: ['/img/Ballena Frente.png', '/img/Ballena Perfil.png'] },
  { key: 'bordeballenal50x50', name: 'BORDE BALLENA L 50X50', priceUnit: 9800, images: ['/img/Ballena L Frente.png', '/img/Ballena L Perfil.png'] },
  { key: 'ballena4050', name: 'BORDE BALLENA 40X50', priceUnit: 9000, images: ['/img/Ballena Frente.png', '/img/Ballena Perfil.png'] },
  { key: 'esquina',     name: 'ESQUINA 50x50',             priceUnit: 10500, images: ['/img/Esquina Frente.png', '/img/Esquina Perfil.png'] },
  { key: 'cuna',        name: 'BORDE ROMANO (CUÑA)', priceUnit: 6000, images: ['/img/Cuña Frente.png', '/img/Ballena Perfil.png'] },
]

export const SERVICES: Service[] = [
  { id: 'svc-install', label: 'Laca (5 Litros)',      price: 70000,  type: 'fixed', priceLabel: '+$70.000' },
  { id: 'svc-seal',    label: 'Cemento Blanco (5KG)', price: 12000, type: 'fixed', priceLabel: '+$12.000' },
]
