'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/config/products'
import { buildPresupuestoQuery, WASTE_FACTOR, type CalcResult, type PieceLine } from '@/lib/poolCalculator'

const fmt = (n: number) =>
  '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

interface ResultSummaryProps {
  result: CalcResult
  products: Product[]
}

export default function ResultSummary({ result, products }: ResultSummaryProps) {
  const router = useRouter()
  const [includeWaste, setIncludeWaste] = useState(true)

  const wastePct = Math.round(WASTE_FACTOR * 100)

  const priceFor = (key: string) =>
    products.find(p => p.key === key)?.priceUnit ?? 0

  const qtyOf = (p: PieceLine) => (includeWaste ? p.qty : p.baseQty)

  const total = result.pieces.reduce((sum, p) => sum + qtyOf(p) * priceFor(p.productKey), 0)

  return (
    <div className="calc-result">
      <div className="summary-title">TU CÁLCULO</div>

      {result.pieces.map(piece => (
        <div key={piece.productKey} className="summary-row">
          <span className="label" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span className="calc-result-name">{piece.label}</span>
            <span style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {includeWaste
                ? `${piece.baseQty} + ${piece.wasteQty} desperdicio = ${piece.qty}`
                : `× ${piece.baseQty}`}
            </span>
          </span>
          <span className="value">{fmt(qtyOf(piece) * priceFor(piece.productKey))}</span>
        </div>
      ))}

      <div
        className={`summary-cash-option${includeWaste ? ' active' : ''}`}
        onClick={() => setIncludeWaste(w => !w)}
      >
        <div className="summary-cash-check">{includeWaste ? '✓' : ''}</div>
        <div className="summary-cash-text">
          <span>MARGEN DE DESPERDICIO {wastePct}%</span>
          <span className="summary-cash-badge">RECOMENDADO</span>
        </div>
      </div>

      <div className="calc-result-note">
        {includeWaste
          ? `Incluye ${wastePct}% de margen de desperdicio por cortes y recortes. `
          : `No incluye margen de desperdicio: ante cortes o roturas podrías necesitar piezas extra. `}
        Las cantidades son aproximadas y sirven como guía: el cálculo final puede variar según
        escaleras, recortes y el diseño de tu pileta.
      </div>

      <div className="summary-total">
        <div className="summary-total-label">TOTAL ESTIMADO</div>
        <div className="summary-total-price">{fmt(total)}</div>
        <button
          className="btn-primary btn-confirm"
          onClick={() => router.push('/presupuesto?' + buildPresupuestoQuery(result, includeWaste))}
        >
          CONTINUAR AL PRESUPUESTO
        </button>
        <div className="calc-result-disclaimer">
          Precio estimado — confirmá las cantidades y solicitá tu presupuesto final.
        </div>
      </div>
    </div>
  )
}
