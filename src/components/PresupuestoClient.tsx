'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useProducts } from '@/hooks/useProducts'
import { useServices } from '@/hooks/useServices'
import { useBaldosas } from '@/hooks/useBaldosas'

function renderName(name: string) {
  const match = name.match(/^(.*?)(\d+X\d+)$/)
  if (!match) return <>{name}</>
  return <>{match[1]}<span style={{ textDecoration: 'underline', textDecorationColor: 'var(--orange)', textUnderlineOffset: '3px' }}>{match[2]}</span></>
}

const fmt = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function PresupuestoClient() {
  const products = useProducts()
  const baldosas = useBaldosas()
  const services = useServices()

  const allProducts = [...products, ...baldosas]

  const [selectedKey, setSelectedKey] = useState('solarium')
  const [qty, setQty] = useState(1)
  const [qtyInput, setQtyInput] = useState('1')
  const [checkedServices, setCheckedServices] = useState<Record<string, boolean>>({})
  const [cashDiscount, setCashDiscount] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('San Luis')
  const [showErrors, setShowErrors] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const selectedProduct = allProducts.find(p => p.key === selectedKey) ?? products[0]
  const isLoseta = products.some(p => p.key === selectedKey)
  const categoryLabel = isLoseta ? 'LOSETAS' : 'BALDOSAS'
  const categoryMsg   = isLoseta ? 'Losetas' : 'Baldosas'

  const tileCost = qty * selectedProduct.priceUnit

  const servicesCost = services.reduce((acc, svc) => {
    if (!checkedServices[svc.id]) return acc
    return acc + (svc.type === 'unit' ? qty * svc.price : svc.price)
  }, 0)

  const subtotal = tileCost + servicesCost
  const discount = cashDiscount ? Math.round(subtotal * 0.05 * 100) / 100 : 0
  const total = subtotal - discount

  const submitQuote = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setShowErrors(true)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    const serviciosSeleccionados = services
      .filter(svc => checkedServices[svc.id])
      .map(svc => svc.label)
      .join(', ') || 'Ninguno'

    fetch('https://script.google.com/macros/s/AKfycbyk-4vejWOToT7EkLcHPgUFlv11aRBwWBM_eSQEe_3xG9hD8lHINI_09Ic6i14hM4k/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: name, email, telefono: phone, provincia: province,
        producto: selectedProduct.name, cantidad: qty,
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
    lines.push(`Producto: ${selectedProduct.name}`)
    lines.push(`Cantidad: ${qty} ${qty === 1 ? 'unidad' : 'unidades'}`)
    lines.push(`${categoryMsg}: ${fmt(tileCost)}`)
    services.forEach(svc => {
      if (checkedServices[svc.id])
        lines.push(`${svc.label}: ${fmt(svc.type === 'unit' ? qty * svc.price : svc.price)}`)
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

          {/* 1. Cantidad */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-num">1</div>
              <div className="form-section-title">CANTIDAD DE UNIDADES</div>
            </div>
            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-group">
                <label>Unidades</label>
                <input
                  type="number" value={qtyInput} min={1} step={1}
                  onChange={e => {
                    setQtyInput(e.target.value)
                    const parsed = parseInt(e.target.value)
                    if (!isNaN(parsed) && parsed >= 1) setQty(parsed)
                  }}
                  onBlur={() => {
                    const parsed = parseInt(qtyInput)
                    const safe = isNaN(parsed) || parsed < 1 ? 1 : parsed
                    setQtyInput(String(safe))
                    setQty(safe)
                  }}
                />
              </div>
            </div>
          </div>

          {/* 2. Modelo */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-num">2</div>
              <div className="form-section-title">ELEGÍ TU MODELO</div>
            </div>

            <div className="section-eyebrow" style={{ marginBottom: '12px' }}>// Losetas Atérmicas</div>
            <div className="tile-options">
              {products.map(product => (
                <div
                  key={product.key}
                  className={`tile-option${selectedKey === product.key ? ' selected' : ''}`}
                  data-product-key={product.key}
                  onClick={() => setSelectedKey(product.key)}
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
                </div>
              ))}
            </div>

            {baldosas.length > 0 && (
              <>
                <div className="section-eyebrow" style={{ marginTop: '28px', marginBottom: '12px' }}>// Baldosas</div>
                <div className="tile-options">
                  {baldosas.map(product => (
                    <div
                      key={product.key}
                      className={`tile-option${selectedKey === product.key ? ' selected' : ''}`}
                      data-product-key={product.key}
                      onClick={() => setSelectedKey(product.key)}
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
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 3. Servicios */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-num">3</div>
              <div className="form-section-title">SERVICIOS ADICIONALES</div>
            </div>
            <div className="form-services">
              {services.map(svc => (
                <label key={svc.id} className="service-label">
                  <input type="checkbox" checked={!!checkedServices[svc.id]} onChange={e => toggleService(svc.id, e.target.checked)} />
                  <span>{svc.label} <span className="service-price">{svc.priceLabel}</span></span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Contacto */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-num">4</div>
              <div className="form-section-title">DATOS DE CONTACTO</div>
            </div>
            <div className="form-contact-grid">
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" placeholder="Tu nombre completo" value={name} onChange={e => setName(e.target.value)} className={showErrors && !name.trim() ? 'input-error' : ''} />
                {showErrors && !name.trim() && <span className="field-error">Campo requerido</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className={showErrors && !email.trim() ? 'input-error' : ''} />
                {showErrors && !email.trim() && <span className="field-error">Campo requerido</span>}
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input type="tel" placeholder="+54 ..." value={phone} onChange={e => setPhone(e.target.value)} className={showErrors && !phone.trim() ? 'input-error' : ''} />
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
            <div style={{ marginTop: '20px' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }} onClick={submitQuote}>
                CONFIRMAR Y ENVIAR PRESUPUESTO
              </button>
            </div>
          </div>

          {/* 5. Ubicación */}
          <div className="form-section">
            <div className="form-section-header">
              <div className="form-section-num">5</div>
              <div className="form-section-title">DÓNDE ENCONTRARNOS</div>
            </div>
            <div style={{ border: '1px solid var(--orange)', outline: '4px solid rgba(232,82,26,0.10)', outlineOffset: '3px', overflow: 'hidden', lineHeight: 0 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1944.9351919409842!2d-65.01325109660768!3d-32.407535665143804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d2e374b60b26ff%3A0x891caa300994e1f2!2sAtermicos%20y%20Baldosas%20Nordico!5e1!3m2!1ses-419!2sar!4v1779069111688!5m2!1ses-419!2sar"
                width="100%" height="1000"
                style={{ border: 0, display: 'block', filter: 'grayscale(10%) contrast(1.1) brightness(0.75)' }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Nordico"
              />
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--dark2)', border: '1px solid var(--border)', borderTop: 'none', fontSize: '12px', color: 'var(--gray)', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.5 }}>
              <span style={{ color: 'var(--orange)', fontSize: '25px' }}>📍</span>
              <span style={{ fontSize: '20px' }}>Sagrada Familia 610 — Carpinteria, San Luis, Argentina</span>
            </div>
          </div>
        </div>

        {/* Panel resumen */}
        <div className="quote-summary">
          <div className="summary-title">RESUMEN</div>

          <div className="summary-row">
            <span className="label">PRODUCTO</span>
            <span className="value">{selectedProduct.name}</span>
          </div>
          <div className="summary-row">
            <span className="label">CANTIDAD</span>
            <span className="value orange">{qty.toLocaleString('es-AR')} {qty === 1 ? 'unidad' : 'unidades'}</span>
          </div>
          <div className="summary-row">
            <span className="label">{categoryLabel}</span>
            <span className="value">{fmt(tileCost)}</span>
          </div>

          {services.map(svc => checkedServices[svc.id] && (
            <div key={svc.id} className="summary-row">
              <span className="label">{svc.label}</span>
              <span className="value">{fmt(svc.type === 'unit' ? qty * svc.price : svc.price)}</span>
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
          <span>Completá todos los datos de contacto para continuar.</span>
          <button className="quote-toast-close" onClick={() => setShowToast(false)}>✕</button>
        </div>
      )}
    </div>
  )
}
