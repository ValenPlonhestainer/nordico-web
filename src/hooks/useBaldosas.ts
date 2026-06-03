import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Product, ColorVariant } from '../config/products'

export function useBaldosas() {
  const [baldosas, setBaldosas] = useState<Product[]>([])

  useEffect(() => {
    if (!supabase) return

    supabase
      .from('baldosas')
      .select('key, name, price_unit, tag, order, images, variants')
      .order('order', { ascending: true })
      .then(({ data, error }) => {
        if (error || !data) return
        setBaldosas(
          data.map(p => ({
            key: p.key,
            name: p.name,
            priceUnit: p.price_unit,
            images: p.images ?? [],
            tag: p.tag ?? undefined,
            variants: (p.variants ?? []) as ColorVariant[],
          }))
        )
      })
  }, [])

  return baldosas
}
