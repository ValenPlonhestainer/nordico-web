import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { SERVICES, type Service } from '../config/products'

export function useServices() {
  const [services, setServices] = useState<Service[]>(SERVICES)

  useEffect(() => {
    if (!supabase) return

    supabase
      .from('services')
      .select('id, label, price, type, price_label')
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return
        setServices(
          data.map(s => ({
            id: s.id,
            label: s.label,
            price: s.price,
            type: s.type as Service['type'],
            priceLabel: s.price_label,
          }))
        )
      })
  }, [])

  return services
}
