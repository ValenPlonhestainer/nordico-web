import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { CATALOG_PRODUCTS, type Product } from '../config/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(CATALOG_PRODUCTS)

  useEffect(() => {
    if (!supabase) return

    supabase
      .from('products')
      .select('key, name, price_unit, tag, order, images')
      .order('order', { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return
        setProducts(
          data.map(p => {
            const local = CATALOG_PRODUCTS.find(c => c.key === p.key)
            return {
              key: p.key,
              name: local?.name ?? p.name,
              priceUnit: p.price_unit,
              images: (p.images && p.images.length > 0) ? p.images : (local?.images ?? []),
              tag: p.tag ?? undefined,
            }
          })
        )
      })
  }, [])

  return products
}
