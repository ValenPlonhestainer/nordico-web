import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Product } from '../config/products'

export function useBaldosas() {
  const [baldosas, setBaldosas] = useState<Product[]>([])

  useEffect(() => {
    if (!supabase) return

    supabase
      .from('baldosas')
      .select('key, name, price_unit, tag, order, images')
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
          }))
        )
      })
  }, [])

  return baldosas
}
