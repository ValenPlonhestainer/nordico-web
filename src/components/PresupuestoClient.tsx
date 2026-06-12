'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import Footer from '@/components/Footer'
import { useProducts } from '@/hooks/useProducts'
import { useServices } from '@/hooks/useServices'
import { useBaldosas } from '@/hooks/useBaldosas'
import { CATALOG_PRODUCTS } from '@/config/products'

function renderName(name: string) {
  const match = name.match(/^(.*?)(\d+X\d+)$/)
  if (!match) return <>{name}</>
  return <>{match[1]}<span style={{ textDecoration: 'underline', textDecorationColor: 'var(--orange)', textUnderlineOffset: '3px' }}>{match[2]}</span></>
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// Cantidades pre-cargadas desde la calculadora: /presupuesto?items=recto:47,esquina:5
const parseItemsParam = (raw: string | null): Record<string, number> => {
  if (!raw) return {}
  const validKeys = new Set(CATALOG_PRODUCTS.map(p => p.key))
  const items: Record<string, number> = {}
  for (const pair of raw.split(',')) {
    const [key, q] = pair.split(':')
    const qty = parseInt(q)
    if (validKeys.has(key) && Number.isFinite(qty) && qty >= 1) items[key] = qty
  }
  return items
}

// Progreso guardado por pestaña: sobrevive a navegación y recargas,
// se borra al cerrar la pestaña
const STORAGE_KEY = 'nordico-presupuesto-v1'

interface SavedQuote {
  selectedProducts: Record<string, number>
  qtyInputs: Record<string, string>
  checkedServices: Record<string, boolean>
  cashDiscount: boolean
  name: string
  email: string
  phone: string
  province: string
}

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)

// Acepta solo cantidades enteras positivas (las claves vienen de nuestra propia app)
const sanitizeQuantities = (v: unknown): Record<string, number> => {
  if (!v || typeof v !== 'object') return {}
  const out: Record<string, number> = {}
  for (const [key, val] of Object.entries(v as Record<string, unknown>)) {
    const qty = typeof val === 'number' ? val : parseInt(String(val))
    if (Number.isFinite(qty) && qty >= 1) out[key] = Math.floor(qty)
  }
  return out
}

export default function PresupuestoClient() {
  const products = useProducts()
  const baldosas = useBaldosas()
  const services = useServices()
  const searchParams = useSearchParams()

  const allProducts = [...products, ...baldosas]

  const initialItems = parseItemsParam(searchParams.get('items'))
  const [selectedProducts, setSelectedProducts] = useState<Record<string, number>>(initialItems)
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(initialItems).map(([k, v]) => [k, String(v)]))
  )
  const [checkedServices, setCheckedServices] = useState<Record<string, boolean>>({})
  const [cashDiscount, setCashDiscount] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('San Luis')
  const [showErrors, setShowErrors] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  // Recién después de restaurar se permite guardar, para no pisar lo
  // guardado con los valores iniciales durante el montaje
  const [hydrated, setHydrated] = useState(false)

  // Restaurar lo guardado en esta pestaña. Si se llega desde la calculadora
  // con ?items=, esas cantidades tienen prioridad sobre lo guardado.
  /* eslint-disable react-hooks/set-state-in-effect -- restauración única desde sessionStorage al montar */
  useEffect(() => {
    const cameFromCalculadora = Object.keys(initialItems).length > 0
    let saved: Partial<SavedQuote> | null = null
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) saved = JSON.parse(raw) as Partial<SavedQuote>
    } catch {
      setHydrated(true)
      return
    }
    if (saved) {
      if (!cameFromCalculadora) {
        const prods = sanitizeQuantities(saved.selectedProducts)
        setSelectedProducts(prods)
        setQtyInputs(Object.fromEntries(Object.entries(prods).map(([k, v]) => [k, String(v)])))
      }
      if (saved.checkedServices && typeof saved.checkedServices === 'object') {
        setCheckedServices(saved.checkedServices)
      }
      setCashDiscount(saved.cashDiscount === true)
      setName(str(saved.name))
      setEmail(str(saved.email))
      setPhone(str(saved.phone))
      setProvince(str(saved.province, 'San Luis'))
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo restaura al montar; initialItems se evalúa una vez
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Guardar el progreso ante cada cambio (solo después de restaurar)
  useEffect(() => {
    if (!hydrated) return
    const state: SavedQuote = {
      selectedProducts, qtyInputs, checkedServices, cashDiscount,
      name, email, phone, province,
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* almacenamiento no disponible */ }
  }, [hydrated, selectedProducts, qtyInputs, checkedServices, cashDiscount, name, email, phone, province])

  const toggleProduct = (key: string) => {
    setSelectedProducts(prev => {
      if (prev[key] !== undefined) {
        const next = { ...prev }
        delete next[key]
        setQtyInputs(qi => { const n = { ...qi }; delete n[key]; return n })
        return next
      }
      setQtyInputs(qi => ({ ...qi, [key]: '1' }))
      return { ...prev, [key]: 1 }
    })
  }

  const setProductQty = (key: string, qty: number) => {
    if (qty < 1) return
    setSelectedProducts(prev => ({ ...prev, [key]: qty }))
    setQtyInputs(prev => ({ ...prev, [key]: String(qty) }))
  }

  const totalUnits = Object.values(selectedProducts).reduce((sum, q) => sum + q, 0)
  const hasProducts = totalUnits > 0
  const selectedEntries = allProducts.filter(p => selectedProducts[p.key] !== undefined)

  const tileCost = allProducts.reduce((sum, p) => {
    const q = selectedProducts[p.key]
    return q ? sum + q * p.priceUnit : sum
  }, 0)

  const servicesCost = services.reduce((acc, svc) => {
    if (!checkedServices[svc.id]) return acc
    return acc + (svc.type === 'unit' ? totalUnits * svc.price : svc.price)
  }, 0)

  const subtotal = tileCost + servicesCost
  const discount = cashDiscount ? Math.round(subtotal * 0.05 * 100) / 100 : 0
  const total = subtotal - discount

  const fireToast = (msg: string) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const submitQuote = () => {
    const missingContact = !name.trim() || !email.trim() || !phone.trim()
    const badEmail = email.trim() !== '' && !isValidEmail(email.trim())
    if (!hasProducts || missingContact || badEmail) {
      setShowErrors(true)
      if (!hasProducts && missingContact) fireToast('Seleccioná al menos un producto y completá tus datos de contacto.')
      else if (!hasProducts) fireToast('Seleccioná al menos un producto para continuar.')
      else if (badEmail) fireToast('Ingresá un correo electrónico válido.')
      else fireToast('Completá todos los datos de contacto para continuar.')
      return
    }

    const serviciosSeleccionados = services
      .filter(svc => checkedServices[svc.id])
      .map(svc => svc.label)
      .join(', ') || 'Ninguno'

    const productosSeleccionados = selectedEntries
      .map(p => `${p.name} × ${selectedProducts[p.key]}`)
      .join(', ')

    fetch('https://script.google.com/macros/s/AKfycbyk-4vejWOToT7EkLcHPgUFlv11aRBwWBM_eSQEe_3xG9hD8lHINI_09Ic6i14hM4k/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: name, email, telefono: phone, provincia: province,
        producto: productosSeleccionados,
        cantidad: totalUnits,
        servicios: serviciosSeleccionados,
        efectivo: cashDiscount ? 'Sí' : 'No',
        total: fmt(total),
      }),
    }).catch(() => {})

    const lines: string[] = []
    lines.push('🏗️ Hola! Me interesa este presupuesto')
    lines.push('*SOLICITUD DE PRESUPUESTO — NORDICO*')
    lines.push('')
    lines.push('👤 *Datos del cliente*')
    if (name)  lines.push(`Nombre: ${name}`)
    if (email) lines.push(`Email: ${email}`)
    if (phone) lines.push(`Teléfono: ${phone}`)
    lines.push(`Provincia: ${province}`)
    lines.push('')
    lines.push('🪨 *Detalle del presupuesto*')
    selectedEntries.forEach(p => {
      const q = selectedProducts[p.key]
      lines.push(`${p.name}: ${q} ${q === 1 ? 'unidad' : 'unidades'} — ${fmt(q * p.priceUnit)}`)
    })
    services.forEach(svc => {
      if (checkedServices[svc.id])
        lines.push(`${svc.label}: ${fmt(svc.type === 'unit' ? totalUnits * svc.price : svc.price)}`)
    })
    if (cashDiscount) lines.push(`Descuento efectivo (5%): − ${fmt(discount)}`)
    lines.push('')
    lines.push(`💰 *TOTAL: ${fmt(total)}*`)

    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/5491163716566?text=${text}`, '_blank')
  }

  const toggleService = (id: string, checked: boolean) =>
    setCheckedServices(prev => ({ ...prev, [id]: checked }))

  return (
    <div id="presupuesto">
      <div className="quote-layout">

        {/* Formulario */}
        <div className="quote-form">
          <h1>SOLICITÁ TU<br /><span style={{ color: 'var(--orange)' }}>PRESUPUESTO</span></h1>
          <p style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '28px', letterSpacing: '0.04em' }}>
            Los campos marcados con <span style={{ color: 'var(--orange)', fontWeight: 700 }}>*</span> son obligatorios.
          </p>

          {/* 1. Modelo */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-num">1</div>
              <div className="form-section-title">ELEGÍ TU MODELO <span style={{ color: 'var(--orange)', fontWeight: 700 }}>*</span></div>
            </div>

            {showErrors && !hasProducts && (
              <div style={{ marginBottom: '16px', color: '#e53e3e', fontSize: '13px', letterSpacing: '0.02em' }}>
                Seleccioná al menos un producto para continuar.
              </div>
            )}

            <div className="section-eyebrow quote-category-eyebrow" style={{ marginBottom: '12px' }}>// Losetas Atérmicas</div>
            <div className="tile-options">
              {products.map(product => {
                const isSelected = selectedProducts[product.key] !== undefined
                const qty = selectedProducts[product.key] ?? 1
                return (
                  <div
                    key={product.key}
                    className={`tile-option${isSelected ? ' selected' : ''}`}
                    data-product-key={product.key}
                    onClick={() => toggleProduct(product.key)}
                  >
                    <div className="check-mark">✓</div>
                    <div className="tile-option-thumb">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={200}
                        height={150}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    </div>
                    <div className="tile-option-name">{renderName(product.name)}</div>
                    <div className="tile-option-price">${product.priceUnit.toLocaleString('es-AR')} <span>c/u</span></div>
                    {isSelected && (
                      <div className="tile-option-qty-row" onClick={e => e.stopPropagation()}>
                        <button className="tile-qty-btn" onClick={() => setProductQty(product.key, qty - 1)}>−</button>
                        <input
                          type="text"
                          inputMode="numeric"
                          className="tile-qty-input"
                          value={qtyInputs[product.key] ?? String(qty)}
                          onChange={e => {
                            setQtyInputs(prev => ({ ...prev, [product.key]: e.target.value }))
                            const val = parseInt(e.target.value)
                            if (!isNaN(val) && val >= 1) setSelectedProducts(prev => ({ ...prev, [product.key]: val }))
                          }}
                          onBlur={() => {
                            const val = parseInt(qtyInputs[product.key] ?? '')
                            const safe = isNaN(val) || val < 1 ? 1 : val
                            setProductQty(product.key, safe)
                          }}
                        />
                        <button className="tile-qty-btn" onClick={() => setProductQty(product.key, qty + 1)}>+</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="section-eyebrow quote-category-eyebrow" style={{ marginTop: '28px', marginBottom: '12px' }}>
              {'// Servicios Adicionales'}
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--gray)', border: '1px solid rgba(255,255,255,0.12)', padding: '2px 8px', marginLeft: '8px' }}>OPCIONAL</span>
            </div>
            <div className="form-services">
              {services.map(svc => (
                <label key={svc.id} className="service-label">
                  <input type="checkbox" checked={!!checkedServices[svc.id]} onChange={e => toggleService(svc.id, e.target.checked)} />
                  <span>{svc.label} <span className="service-price">{svc.priceLabel}</span></span>
                </label>
              ))}
            </div>

            {baldosas.length > 0 && (
              <>
                <div className="section-eyebrow quote-category-eyebrow" style={{ marginTop: '28px', marginBottom: '12px' }}>// Baldosas</div>
                <div className="tile-options">
                  {baldosas.map(product => {
                    const isSelected = selectedProducts[product.key] !== undefined
                    const qty = selectedProducts[product.key] ?? 1
                    return (
                      <div
                        key={product.key}
                        className={`tile-option${isSelected ? ' selected' : ''}`}
                        data-product-key={product.key}
                        onClick={() => toggleProduct(product.key)}
                      >
                        <div className="check-mark">✓</div>
                        <div className="tile-option-thumb">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={200}
                            height={150}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                          />
                        </div>
                        <div className="tile-option-name">{renderName(product.name)}</div>
                        <div className="tile-option-price">${product.priceUnit.toLocaleString('es-AR')} <span>m2</span></div>
                        {isSelected && (
                          <div className="tile-option-qty-row" onClick={e => e.stopPropagation()}>
                            <button className="tile-qty-btn" onClick={() => setProductQty(product.key, qty - 1)}>−</button>
                            <input
                              type="text"
                              inputMode="numeric"
                              className="tile-qty-input"
                              value={qtyInputs[product.key] ?? String(qty)}
                              onChange={e => {
                                setQtyInputs(prev => ({ ...prev, [product.key]: e.target.value }))
                                const val = parseInt(e.target.value)
                                if (!isNaN(val) && val >= 1) setSelectedProducts(prev => ({ ...prev, [product.key]: val }))
                              }}
                              onBlur={() => {
                                const val = parseInt(qtyInputs[product.key] ?? '')
                                const safe = isNaN(val) || val < 1 ? 1 : val
                                setProductQty(product.key, safe)
                              }}
                            />
                            <button className="tile-qty-btn" onClick={() => setProductQty(product.key, qty + 1)}>+</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* 2. Contacto */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-num">2</div>
              <div className="form-section-title">DATOS DE CONTACTO <span style={{ color: 'var(--orange)', fontWeight: 700 }}>*</span></div>
            </div>
            <div className="form-contact-grid">
              <div className="form-group">
                <label>Nombre <span style={{ color: 'var(--orange)' }}>*</span></label>
                <input type="text" placeholder="Tu nombre completo" required value={name} onChange={e => setName(e.target.value)} className={showErrors && !name.trim() ? 'input-error' : ''} />
                {showErrors && !name.trim() && <span className="field-error">Campo requerido</span>}
              </div>
              <div className="form-group">
                <label>Email <span style={{ color: 'var(--orange)' }}>*</span></label>
                <input type="email" placeholder="tu@email.com" required value={email} onChange={e => setEmail(e.target.value)} className={showErrors && (!email.trim() || !isValidEmail(email.trim())) ? 'input-error' : ''} />
                {showErrors && !email.trim() && <span className="field-error">Campo requerido</span>}
                {showErrors && email.trim() && !isValidEmail(email.trim()) && <span className="field-error">Ingresá un correo válido (ej: nombre@mail.com)</span>}
              </div>
              <div className="form-group">
                <label>Teléfono <span style={{ color: 'var(--orange)' }}>*</span></label>
                <input type="tel" placeholder="+54 ..." required value={phone} onChange={e => setPhone(e.target.value)} className={showErrors && !phone.trim() ? 'input-error' : ''} />
                {showErrors && !phone.trim() && <span className="field-error">Campo requerido</span>}
              </div>
              <div className="form-group">
                <label>Provincia</label>
                <select value={province} onChange={e => setProvince(e.target.value)}>
                  <option>Buenos Aires</option>
                  <option>Córdoba</option>
                  <option>Santa Fe</option>
                  <option>Mendoza</option>
                  <option>San Luis</option>
                  <option>Otra</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Panel resumen */}
        <div className="quote-summary">
          <div className="summary-title">RESUMEN</div>

          {!hasProducts ? (
            <div style={{ color: 'var(--gray)', fontSize: '13px', lineHeight: 1.6, paddingBottom: '16px', borderBottom: '1px solid var(--border-line)' }}>
              Seleccioná uno o más productos para ver el resumen.
            </div>
          ) : (
            selectedEntries.map(p => (
              <div key={p.key} className="summary-row">
                <span className="label" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span>{p.name}</span>
                  <span style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>× {selectedProducts[p.key]}</span>
                </span>
                <span className="value">{fmt(selectedProducts[p.key] * p.priceUnit)}</span>
              </div>
            ))
          )}

          {services.map(svc => checkedServices[svc.id] && (
            <div key={svc.id} className="summary-row">
              <span className="label">{svc.label}</span>
              <span className="value">{fmt(svc.type === 'unit' ? totalUnits * svc.price : svc.price)}</span>
            </div>
          ))}

          <div className={`summary-cash-option${cashDiscount ? ' active' : ''}`} onClick={() => setCashDiscount(d => !d)}>
            <div className="summary-cash-check">{cashDiscount ? '✓' : ''}</div>
            <div className="summary-cash-text">
              <span>PAGO EN EFECTIVO</span>
              <span className="summary-cash-badge">5% OFF</span>
            </div>
          </div>

          {cashDiscount && (
            <div className="summary-row">
              <span className="label">DESCUENTO EFECTIVO</span>
              <span className="value summary-discount">− {fmt(discount)}</span>
            </div>
          )}

          <div className="summary-total">
            <div className="summary-total-label">TOTAL</div>
            <div className="summary-total-price">{fmt(total)}</div>
            <button className="btn-primary btn-confirm" onClick={submitQuote}>
              CONFIRMAR Y SOLICITAR PRESUPUESTO
            </button>
          </div>
        </div>

      </div>
      {showToast && (
        <div className="quote-toast">
          <span className="quote-toast-icon">⚠</span>
          <span>{toastMsg}</span>
          <button className="quote-toast-close" onClick={() => setShowToast(false)}>✕</button>
        </div>
      )}
      <Footer />
    </div>
  )
}
