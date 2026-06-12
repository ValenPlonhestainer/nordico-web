'use client'
import { useEffect, useMemo, useState } from 'react'
import Footer from '@/components/Footer'
import { useProducts } from '@/hooks/useProducts'
import PoolPlanner from './PoolPlanner'
import StepPanels, { type Step } from './StepPanels'
import ResultSummary from './ResultSummary'
import {
  calculatePool,
  constrainSolarium,
  findFreeSpot,
  reconcileSolariums,
  snapToGrid,
  clamp,
  POOL_MIN_SIDE,
  POOL_MAX_SIDE,
  SOLARIUM_DEFAULT_SIDE,
  TILE_SIZE,
  type BorderKey,
  type SolariumArea,
} from '@/lib/poolCalculator'

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`

// Progreso del wizard guardado por pestaña: sobrevive a la navegación
// entre páginas y a recargas, se borra al cerrar la pestaña
const STORAGE_KEY = 'nordico-calculadora-v1'

interface SavedState {
  step: Step
  shapeChosen: boolean
  borderKey: BorderKey | null
  length: number
  width: number
  solariums: SolariumArea[]
}

export default function CalculadoraClient() {
  const products = useProducts()

  const [step, setStep] = useState<Step>(1)
  const [shapeChosen, setShapeChosen] = useState(false)
  const [borderKey, setBorderKey] = useState<BorderKey | null>(null)
  const [length, setLength] = useState(8)
  const [width, setWidth] = useState(4)
  const [solariums, setSolariums] = useState<SolariumArea[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Recién después de restaurar se permite guardar, para no pisar lo
  // guardado con los valores por defecto durante el montaje
  const [hydrated, setHydrated] = useState(false)

  // Restaurar el progreso guardado en esta pestaña, validando cada campo
  /* eslint-disable react-hooks/set-state-in-effect -- restauración única desde sessionStorage al montar */
  useEffect(() => {
    let saved: Partial<SavedState> | null = null
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) saved = JSON.parse(raw) as Partial<SavedState>
    } catch {
      setHydrated(true)
      return
    }
    if (!saved) {
      setHydrated(true)
      return
    }

    const safeLength = typeof saved.length === 'number' && Number.isFinite(saved.length)
      ? clamp(snapToGrid(saved.length), POOL_MIN_SIDE, POOL_MAX_SIDE)
      : 8
    const safeWidth = typeof saved.width === 'number' && Number.isFinite(saved.width)
      ? clamp(snapToGrid(saved.width), POOL_MIN_SIDE, POOL_MAX_SIDE)
      : 4
    const safeBorder = saved.borderKey === 'recto' || saved.borderKey === 'ballena5050'
      ? saved.borderKey
      : null
    const safeShape = saved.shapeChosen === true
    const safeSolariums = Array.isArray(saved.solariums)
      ? reconcileSolariums(
          saved.solariums.filter(s =>
            s && typeof s.id === 'string' &&
            [s.x, s.y, s.w, s.h].every(n => typeof n === 'number' && Number.isFinite(n))
          ),
          { length: safeLength, width: safeWidth },
        )
      : []
    const maxStep: Step = !safeShape ? 1 : !safeBorder ? 2 : 4
    const savedStep = typeof saved.step === 'number' ? saved.step : 1
    const safeStep = Math.min(Math.max(Math.round(savedStep), 1), maxStep) as Step

    setShapeChosen(safeShape)
    setBorderKey(safeBorder)
    setLength(safeLength)
    setWidth(safeWidth)
    setSolariums(safeSolariums)
    setStep(safeStep)
    setHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Guardar el progreso ante cada cambio (solo después de restaurar)
  useEffect(() => {
    if (!hydrated) return
    const state: SavedState = { step, shapeChosen, borderKey, length, width, solariums }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* almacenamiento no disponible */ }
  }, [hydrated, step, shapeChosen, borderKey, length, width, solariums])

  const result = useMemo(
    () => borderKey
      ? calculatePool({ shape: 'rect', length, width, borderKey, solariums })
      : null,
    [borderKey, length, width, solariums],
  )

  const setPoolSide = (side: 'length' | 'width', value: number) => {
    const safe = clamp(snapToGrid(value), POOL_MIN_SIDE, POOL_MAX_SIDE)
    const nextLength = side === 'length' ? safe : length
    const nextWidth = side === 'width' ? safe : width
    if (side === 'length') setLength(safe)
    else setWidth(safe)
    setSolariums(prev => reconcileSolariums(prev, { length: nextLength, width: nextWidth }))
  }

  const updateSolarium = (next: SolariumArea) => {
    setSolariums(prev => {
      const previous = prev.find(s => s.id === next.id)
      if (!previous) return prev
      const others = prev.filter(s => s.id !== next.id)
      const constrained = constrainSolarium(next, previous, { length, width }, others)
      return prev.map(s => (s.id === next.id ? constrained : s))
    })
  }

  const addSolarium = (cx?: number, cy?: number) => {
    // Sin coordenadas (botón AGREGAR ÁREA): probar arriba de la pileta
    const targetX = cx ?? length / 2
    const targetY = cy ?? -(TILE_SIZE + SOLARIUM_DEFAULT_SIDE / 2)
    const spot = findFreeSpot(
      targetX, targetY,
      SOLARIUM_DEFAULT_SIDE, SOLARIUM_DEFAULT_SIDE,
      { length, width }, solariums,
    )
    if (!spot) return
    const area: SolariumArea = { id: newId(), ...spot }
    setSolariums(prev => [...prev, area])
    setSelectedId(area.id)
  }

  const removeSolarium = (id: string) => {
    setSolariums(prev => prev.filter(s => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div id="calculadora">
      <div className="calc-header">
        <h1>CALCULÁ TU<br /><span style={{ color: 'var(--orange)' }}>PILETA</span></h1>
        <p>
          Ingresá la forma y las medidas de tu pileta. Te decimos cuántas losetas
          necesitás y podés continuar al presupuesto con las cantidades cargadas.
        </p>
      </div>

      <div className="calc-layout">
        <div className="calc-planner-col">
          <PoolPlanner
            length={length}
            width={width}
            solariums={solariums}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={updateSolarium}
            onAddAt={(x, y) => addSolarium(x, y)}
            interactive={step === 4}
          />
          <p className="calc-planner-hint">
            {step === 4
              ? 'Tocá el plano para agregar un solarium. Arrastralo para moverlo o estiralo desde los puntos del contorno.'
              : 'El plano se actualiza en tiempo real a medida que completás los pasos.'}
          </p>
        </div>

        <div className="calc-steps-col">
          <StepPanels
            step={step}
            setStep={setStep}
            shapeChosen={shapeChosen}
            onChooseShape={() => setShapeChosen(true)}
            borderKey={borderKey}
            onChooseBorder={setBorderKey}
            length={length}
            width={width}
            onSideChange={setPoolSide}
            solariums={solariums}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateSolarium={updateSolarium}
            onAddArea={() => addSolarium()}
            onRemoveArea={removeSolarium}
            products={products}
          />

          {result && step === 4 && (
            <ResultSummary result={result} products={products} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
