'use client'
import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/config/products'
import {
  BORDER_LABELS,
  POOL_MIN_SIDE,
  POOL_MAX_SIDE,
  SIDE_SOLARIUM_DEPTH,
  TILE_SIZE,
  type BorderKey,
  type PoolSide,
  type SolariumArea,
} from '@/lib/poolCalculator'

export type Step = 1 | 2 | 3 | 4

const BORDER_KEYS: BorderKey[] = ['recto', 'ballena5050']

interface StepPanelsProps {
  step: Step
  setStep: (s: Step) => void
  shapeChosen: boolean
  onChooseShape: () => void
  borderKey: BorderKey | null
  onChooseBorder: (k: BorderKey) => void
  length: number
  width: number
  onSideChange: (side: 'length' | 'width', value: number) => void
  solariums: SolariumArea[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdateSolarium: (next: SolariumArea) => void
  onAddSide: (side: PoolSide) => void
  onRemoveArea: (id: string) => void
  products: Product[]
}

const SIDE_BUTTONS: { side: PoolSide; arrow: string; label: string }[] = [
  { side: 'bottom', arrow: '↓', label: 'ABAJO' },
  { side: 'top', arrow: '↑', label: 'ARRIBA' },
  { side: 'left', arrow: '←', label: 'IZQUIERDA' },
  { side: 'right', arrow: '→', label: 'DERECHA' },
]

const m2 = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function StepPanels(props: StepPanelsProps) {
  const {
    step, setStep, shapeChosen, onChooseShape, borderKey, onChooseBorder,
    length, width, onSideChange, solariums, selectedId, onSelect,
    onUpdateSolarium, onAddSide, onRemoveArea, products,
  } = props

  const solariumM2 = solariums.reduce((sum, s) => sum + s.w * s.h, 0)
  const solariumTiles = Math.ceil(solariumM2 / (TILE_SIZE * TILE_SIZE))

  // Borradores de los inputs: se escribe libre y se valida al salir del campo
  const [dimDrafts, setDimDrafts] = useState<{ length: string | null; width: string | null }>({ length: null, width: null })
  const [areaDrafts, setAreaDrafts] = useState<Record<string, string>>({})

  const commitDim = (side: 'length' | 'width') => {
    const raw = dimDrafts[side]
    if (raw !== null) {
      const v = parseFloat(raw.replace(',', '.'))
      if (!isNaN(v)) onSideChange(side, v)
    }
    setDimDrafts(d => ({ ...d, [side]: null }))
  }

  const commitArea = (area: SolariumArea, dim: 'w' | 'h') => {
    const key = `${area.id}:${dim}`
    const raw = areaDrafts[key]
    if (raw !== undefined) {
      const v = parseFloat(raw.replace(',', '.'))
      if (!isNaN(v) && v > 0) onUpdateSolarium({ ...area, [dim]: v })
    }
    setAreaDrafts(d => {
      const next = { ...d }
      delete next[key]
      return next
    })
  }

  const blurOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur()
  }

  const canGo = (n: Step): boolean => {
    if (n === 1) return true
    if (n === 2) return shapeChosen
    return shapeChosen && borderKey !== null
  }

  const chips: { n: Step; label: string; done: boolean; value: string }[] = [
    { n: 1, label: 'FORMA', done: shapeChosen, value: 'RECTANGULAR' },
    { n: 2, label: 'BORDE', done: borderKey !== null, value: borderKey ? BORDER_LABELS[borderKey] : '' },
    { n: 3, label: 'MEDIDAS', done: step > 3, value: `${length} × ${width} m` },
    { n: 4, label: 'SOLARIUM', done: step === 4 && solariums.length > 0, value: solariums.length > 0 ? `${solariumTiles} losetas` : '' },
  ]

  const borderProducts = BORDER_KEYS
    .map(key => products.find(p => p.key === key))
    .filter((p): p is Product => p !== undefined)

  return (
    <div className="calc-steps">

      {/* Chips de progreso */}
      <div className="calc-chips">
        {chips.map(chip => {
          const isActive = chip.n === step
          const clickable = canGo(chip.n) && !isActive
          return (
            <button
              key={chip.n}
              className={`calc-chip${isActive ? ' active' : ''}${chip.done ? ' done' : ''}`}
              disabled={!canGo(chip.n)}
              onClick={() => clickable && setStep(chip.n)}
            >
              <span className="calc-chip-num">{chip.done && !isActive ? '✓' : chip.n}</span>
              <span className="calc-chip-text">
                <span className="calc-chip-label">{chip.label}</span>
                {chip.done && chip.value && <span className="calc-chip-value">{chip.value}</span>}
              </span>
            </button>
          )
        })}
      </div>

      {/* Paso 1: Forma */}
      {step === 1 && (
        <div className="calc-step-panel">
          <div className="form-section-header">
            <div className="form-section-num">1</div>
            <div className="form-section-title">ELEGÍ LA FORMA DE TU PILETA</div>
          </div>
          <div className="calc-options">
            <div
              className={`calc-option${shapeChosen ? ' selected' : ''}`}
              onClick={onChooseShape}
            >
              <div className="calc-option-check">✓</div>
              <svg viewBox="0 0 64 40" className="calc-option-icon" aria-hidden="true">
                <rect x="6" y="6" width="52" height="28" fill="rgba(232,82,26,0.15)" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div className="calc-option-name">RECTANGULAR</div>
              <div className="calc-option-sub">Rincones rectos</div>
            </div>
            <div className="calc-option disabled">
              <span className="calc-option-badge">PRÓXIMAMENTE</span>
              <svg viewBox="0 0 64 40" className="calc-option-icon" aria-hidden="true">
                <rect x="6" y="6" width="52" height="28" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div className="calc-option-name">RINCONES CURVOS</div>
              <div className="calc-option-sub">Esquinas redondeadas</div>
            </div>
            <div className="calc-option disabled">
              <span className="calc-option-badge">PRÓXIMAMENTE</span>
              <svg viewBox="0 0 64 40" className="calc-option-icon" aria-hidden="true">
                <path d="M8 8 H40 V20 H56 V32 H8 Z" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <div className="calc-option-name">FORMA EN L</div>
              <div className="calc-option-sub">Y otras formas</div>
            </div>
          </div>
          <div className="calc-step-actions">
            <button className="btn-primary" disabled={!shapeChosen} onClick={() => setStep(2)}>
              CONTINUAR
            </button>
            {!shapeChosen && <span className="calc-step-hint">Falta: elegí la forma de tu pileta</span>}
          </div>
        </div>
      )}

      {/* Paso 2: Borde */}
      {step === 2 && (
        <div className="calc-step-panel">
          <div className="form-section-header">
            <div className="form-section-num">2</div>
            <div className="form-section-title">ELEGÍ EL BORDE ATÉRMICO</div>
          </div>
          <div className="calc-options">
            {borderProducts.map(product => (
              <div
                key={product.key}
                className={`calc-option with-image${borderKey === product.key ? ' selected' : ''}`}
                onClick={() => onChooseBorder(product.key as BorderKey)}
              >
                <div className="calc-option-check">✓</div>
                <div className="calc-option-thumb">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={200}
                    height={150}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
                <div className="calc-option-name">{product.name}</div>
                <div className="calc-option-sub">${product.priceUnit.toLocaleString('es-AR')} <span>c/u</span></div>
              </div>
            ))}
          </div>
          <div className="calc-step-actions">
            <button className="btn-primary" disabled={!borderKey} onClick={() => setStep(3)}>
              CONTINUAR
            </button>
            {!borderKey && <span className="calc-step-hint">Falta: elegí un modelo de borde</span>}
          </div>
        </div>
      )}

      {/* Paso 3: Medidas */}
      {step === 3 && (
        <div className="calc-step-panel">
          <div className="form-section-header">
            <div className="form-section-num">3</div>
            <div className="form-section-title">MEDIDAS INTERNAS DE TU PILETA</div>
          </div>
          <p className="calc-step-note">
            Medí la distancia entre las paredes internas de la pileta, en metros
            ({POOL_MIN_SIDE} a {POOL_MAX_SIDE} m, de a 0,5 m).
          </p>
          <div className="calc-dimensions">
            {([['length', 'LARGO', length], ['width', 'ANCHO', width]] as const).map(([side, label, value]) => (
              <div key={side} className="calc-dimension">
                <label>{label} (M)</label>
                <div className="calc-stepper">
                  <button
                    className="tile-qty-btn"
                    onClick={() => {
                      setDimDrafts(d => ({ ...d, [side]: null }))
                      onSideChange(side, value - 0.5)
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={dimDrafts[side] ?? String(value)}
                    onChange={e => setDimDrafts(d => ({ ...d, [side]: e.target.value }))}
                    onBlur={() => commitDim(side)}
                    onKeyDown={blurOnEnter}
                  />
                  <button
                    className="tile-qty-btn"
                    onClick={() => {
                      setDimDrafts(d => ({ ...d, [side]: null }))
                      onSideChange(side, value + 0.5)
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="calc-step-actions">
            <button className="btn-primary" onClick={() => setStep(4)}>
              CONTINUAR
            </button>
          </div>
        </div>
      )}

      {/* Paso 4: Solariums */}
      {step === 4 && (
        <div className="calc-step-panel">
          <div className="form-section-header">
            <div className="form-section-num">4</div>
            <div className="form-section-title">SOLARIUMS</div>
            <span className="calc-optional-badge">OPCIONAL</span>
          </div>
          <p className="calc-step-note">
            <strong>¿Querés agregar un solarium?</strong> Elegí de qué lado de la
            pileta va — lo creamos del largo del lado × {SIDE_SOLARIUM_DEPTH} m
            y lo ajustás en el plano.
          </p>
          <div className="calc-side-btns">
            {SIDE_BUTTONS.map(({ side, arrow, label }) => (
              <button key={side} className="calc-side-btn" onClick={() => onAddSide(side)}>
                <span className="calc-side-arrow">{arrow}</span> {label}
              </button>
            ))}
          </div>

          {selectedId && (
            <div className="calc-selected-box">
              <p className="calc-selected-hint">
                <strong>Tocá la grilla</strong> hasta donde querés que llegue ·
                arrastrá la <strong>esquina</strong> para afinar ·
                arrastrá el cuerpo para moverlo
              </p>
              <div className="calc-selected-actions">
                <button className="calc-selected-delete" onClick={() => onRemoveArea(selectedId)}>
                  ELIMINAR
                </button>
                <button className="btn-primary calc-selected-done" onClick={() => onSelect(null)}>
                  LISTO
                </button>
              </div>
            </div>
          )}

          {solariums.length > 0 && (
            <div className="calc-area-list">
              {solariums.map((area, i) => (
                <div
                  key={area.id}
                  className={`calc-area-row${selectedId === area.id ? ' selected' : ''}`}
                  onClick={() => onSelect(area.id)}
                >
                  <span className="calc-area-num">{i + 1}</span>
                  <div className="calc-area-inputs" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={areaDrafts[`${area.id}:w`] ?? String(area.w)}
                      onChange={e => setAreaDrafts(d => ({ ...d, [`${area.id}:w`]: e.target.value }))}
                      onBlur={() => commitArea(area, 'w')}
                      onKeyDown={blurOnEnter}
                    />
                    <span className="calc-area-x">×</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={areaDrafts[`${area.id}:h`] ?? String(area.h)}
                      onChange={e => setAreaDrafts(d => ({ ...d, [`${area.id}:h`]: e.target.value }))}
                      onBlur={() => commitArea(area, 'h')}
                      onKeyDown={blurOnEnter}
                    />
                    <span className="calc-area-unit">m</span>
                  </div>
                  <span className="calc-area-m2">{m2(area.w * area.h)} m²</span>
                  <button
                    className="calc-area-remove"
                    aria-label={`Eliminar área ${i + 1}`}
                    onClick={e => { e.stopPropagation(); onRemoveArea(area.id) }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="calc-area-total">
                <span>TOTAL SOLARIUM</span>
                <span>{solariumTiles} {solariumTiles === 1 ? 'loseta' : 'losetas'} · {solariums.length} {solariums.length === 1 ? 'área' : 'áreas'}</span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
