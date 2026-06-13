import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CATALOG_PRODUCTS } from '@/config/products'
import ProductDetailClient from '@/components/ProductDetailClient'
import type { Product, ColorVariant } from '@/config/products'

function makeSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

async function getProductData(key: string): Promise<{ product: Product; related: Product[]; isBaldosa: boolean } | null> {
  const sb = makeSupabase()

  if (sb) {
    const { data: p } = await sb
      .from('products')
      .select('key, name, price_unit, tag, order, images')
      .eq('key', key)
      .single()

    if (p) {
      const local = CATALOG_PRODUCTS.find(c => c.key === key)
      const product: Product = {
        key: p.key,
        name: local?.name ?? p.name,
        priceUnit: p.price_unit,
        images: p.images?.length ? p.images : (local?.images ?? []),
        tag: p.tag ?? undefined,
      }

      const { data: rel } = await sb
        .from('products')
        .select('key, name, price_unit, tag, order, images')
        .neq('key', key)
        .order('order', { ascending: true })
        .limit(4)

      const related: Product[] = (rel ?? []).map(r => {
        const loc = CATALOG_PRODUCTS.find(c => c.key === r.key)
        return {
          key: r.key,
          name: loc?.name ?? r.name,
          priceUnit: r.price_unit,
          images: r.images?.length ? r.images : (loc?.images ?? []),
          tag: r.tag ?? undefined,
        }
      })

      return { product, related, isBaldosa: false }
    }

    const { data: b } = await sb
      .from('baldosas')
      .select('key, name, price_unit, tag, order, images, variants')
      .eq('key', key)
      .single()

    if (b) {
      const product: Product = {
        key: b.key,
        name: b.name,
        priceUnit: b.price_unit,
        images: b.images ?? [],
        tag: b.tag ?? undefined,
        variants: (b.variants ?? []) as ColorVariant[],
      }

      const { data: rel } = await sb
        .from('baldosas')
        .select('key, name, price_unit, tag, order, images, variants')
        .neq('key', key)
        .order('order', { ascending: true })
        .limit(4)

      const related: Product[] = (rel ?? []).map(r => ({
        key: r.key,
        name: r.name,
        priceUnit: r.price_unit,
        images: r.images ?? [],
        tag: r.tag ?? undefined,
        variants: (r.variants ?? []) as ColorVariant[],
      }))

      return { product, related, isBaldosa: true }
    }
  }

  // Fallback local
  const local = CATALOG_PRODUCTS.find(c => c.key === key)
  if (local) {
    return {
      product: local,
      related: CATALOG_PRODUCTS.filter(c => c.key !== key).slice(0, 4),
      isBaldosa: false,
    }
  }

  return null
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params
  const data = await getProductData(key)
  if (!data) return { title: 'Producto no encontrado' }

  const { product } = data
  return {
    title: `${product.name} — Losetas Atérmicas Nordico`,
    description: `${product.name} de la línea atérmica Nordico. Precio desde $${product.priceUnit.toLocaleString('es-AR')}. Material que no levanta temperatura al sol, antideslizante y resistente al cloro.`,
    alternates: { canonical: `https://www.nordico.net.ar/productos/${key}` },
    openGraph: {
      title: `${product.name} — Nordico`,
      description: `Loseta atérmica ${product.name}. No levanta temperatura al sol, antideslizante, ideal para bordes de pileta.`,
      url: `https://www.nordico.net.ar/productos/${key}`,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const data = await getProductData(key)

  if (!data) return notFound()

  return <ProductDetailClient product={data.product} related={data.related} isBaldosa={data.isBaldosa} />
}
