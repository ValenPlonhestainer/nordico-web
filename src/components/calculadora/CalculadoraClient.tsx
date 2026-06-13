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
  extendSolariumTo,
  findFreeSpot,
  reconcileSolariums,
  sideSolariumSpot,
  snapToGrid,
  clamp,
  POOL_MIN_SIDE,
  POOL_MAX_SIDE,
  SOLARIUM_DEFAULT_SIDE,
  TILE_SIZE,
  GRID_SNAP,
  type BorderKey,
  type PoolShape,
  type PoolSide,
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
  shape: PoolShape | null
  shapeChosen?: boolean // legado — se convierte a shape al restaurar
  borderKey: BorderKey | null
  length: number
  width: number
  length2: number
  width2: number
  solariums: SolariumArea[]
}

export default function CalculadoraClient() {
  const products = useProducts()

  const [step, setStep] = useState<Step>(1)
  const [shape, setShape] = useState<PoolShape | null>(null)
  const [borderKey, setBorderKey] = useState<BorderKey | null>(null)
  const [length, setLength] = useState(8)
  const [width, setWidth] = useState(4)
  const [length2, setLength2] = useState(3)
  const [width2, setWidth2] = useState(2)
  const [solariums, setSolariums] = useState<SolariumArea[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Medida resaltada en el plano según el input enfocado en el paso 3
  const [highlightDim, setHighlightDim] = useState<'length' | 'width' | null>(null)
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
    // Compatibilidad con sesiones antiguas que guardaban shapeChosen: boolean
    const safeShape: PoolShape | null =
      (saved.shape === 'rect' || saved.shape === 'lshape' || saved.shape === 'arco')
        ? saved.shape
        : (saved.shapeChosen === true ? 'rect' : null)
    const safeLength2 = typeof saved.length2 === 'number' && Number.isFinite(saved.length2)
      ? clamp(snapToGrid(saved.length2), GRID_SNAP, safeLength - GRID_SNAP)
      : Math.min(3, safeLength - GRID_SNAP)
    const safeWidth2 = typeof saved.width2 === 'number' && Number.isFinite(saved.width2)
      ? clamp(snapToGrid(saved.width2), GRID_SNAP, safeWidth - GRID_SNAP)
      : Math.min(2, safeWidth - GRID_SNAP)
    const safeSolariums = Array.isArray(saved.solariums)
      ? reconcileSolariums(
          saved.solariums.filter(s =>
            s && typeof s.id === 'string' &&
            [s.x, s.y, s.w, s.h].every(n => typeof n === 'number' && Number.isFinite(n))
          ),
          { length: safeLength, width: safeWidth },
        )
      : []
    const maxStep: Step = safeShape === null ? 1 : !safeBorder ? 2 : 5
    const savedStep = typeof saved.step === 'number' ? saved.step : 1
    const safeStep = Math.min(Math.max(Math.round(savedStep), 1), maxStep) as Step

    setShape(safeShape)
    setBorderKey(safeBorder)
    setLength(safeLength)
    setWidth(safeWidth)
    setLength2(safeLength2)
    setWidth2(safeWidth2)
    setSolariums(safeSolariums)
    setStep(safeStep)
    setHydrated(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Guardar el progreso ante cada cambio (solo después de restaurar)
  useEffect(() => {
    if (!hydrated) return
    const state: SavedState = { step, shape, borderKey, length, width, length2, width2, solariums }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* almacenamiento no disponible */ }
  }, [hydrated, step, shape, borderKey, length, width, length2, width2, solariums])

  const result = useMemo(
    () => borderKey && shape
      ? calculatePool({ shape, length, width, length2, width2, borderKey, solariums })
      : null,
    [shape, borderKey, length, width, length2, width2, solariums],
  )

  const setPoolSide = (side: 'length' | 'width', value: number) => {
    const safe = clamp(snapToGrid(value), POOL_MIN_SIDE, POOL_MAX_SIDE)
    const nextLength = side === 'length' ? safe : length
    const nextWidth = side === 'width' ? safe : width
    if (side === 'length') {
      setLength(safe)
      setLength2(prev => clamp(prev, GRID_SNAP, safe - GRID_SNAP))
    } else {
      setWidth(safe)
      setWidth2(prev => clamp(prev, GRID_SNAP, safe - GRID_SNAP))
    }
    setSolariums(prev => reconcileSolariums(prev, { length: nextLength, width: nextWidth }))
  }

  const setLShapeSide = (side: 'length2' | 'width2', value: number) => {
    if (side === 'length2') {
      setLength2(clamp(snapToGrid(value), GRID_SNAP, length - GRID_SNAP))
    } else {
      setWidth2(clamp(snapToGrid(value), GRID_SNAP, width - GRID_SNAP))
    }
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

  // Botones Abajo/Arriba/Izquierda/Derecha: solarium de todo el lado × 1 m
  const addSolariumSide = (side: PoolSide) => {
    const spot = sideSolariumSpot(side, { length, width }, solariums)
    if (!spot) return
    const area: SolariumArea = { id: newId(), ...spot }
    setSolariums(prev => [...prev, area])
    setSelectedId(area.id)
  }

  // Tocar la grilla con un solarium seleccionado lo estira hasta esa celda.
  // Si la extensión completa choca (pileta/otros), se intenta por cada eje;
  // solo se aplica un candidato que quede válido tal cual (sin corrimientos)
  const extendSolarium = (mx: number, my: number) => {
    setSolariums(prev => {
      const area = prev.find(s => s.id === selectedId)
      if (!area) return prev
      const others = prev.filter(s => s.id !== area.id)
      const sameRect = (a: SolariumArea, b: SolariumArea) =>
        a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h
      const attempt = (cand: SolariumArea): SolariumArea | null => {
        if (sameRect(cand, area)) return null
        const constrained = constrainSolarium(cand, area, { length, width }, others)
        return sameRect(constrained, cand) ? constrained : null
      }
      const full = extendSolariumTo(area, mx, my)
      const next =
        attempt(full) ??
        attempt({ ...full, y: area.y, h: area.h }) ??
        attempt({ ...full, x: area.x, w: area.w })
      return next ? prev.map(s => (s.id === area.id ? next : s)) : prev
    })
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

      <div className="calc-layout" data-step={step}>
        <div className="calc-planner-col">
          <PoolPlanner
            shape={shape ?? 'rect'}
            length={length}
            width={width}
            length2={length2}
            width2={width2}
            solariums={solariums}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={updateSolarium}
            onAddAt={(x, y) => addSolarium(x, y)}
            onExtendTo={extendSolarium}
            interactive={step === 4}
            highlightDim={highlightDim}
          />
          <p className="calc-planner-hint">
            {step === 4
              ? 'Agregá un solarium con los botones o tocando el plano. Con uno seleccionado: tocá la grilla hasta donde querés que llegue, arrastrá la esquina para afinar o arrastrá el cuerpo para moverlo.'
              : 'El plano se actualiza en tiempo real a medida que completás los pasos.'}
          </p>
        </div>

        <div className="calc-steps-col">
          <StepPanels
            step={step}
            setStep={setStep}
            shape={shape}
            onChooseShape={setShape}
            borderKey={borderKey}
            onChooseBorder={setBorderKey}
            length={length}
            width={width}
            length2={length2}
            width2={width2}
            onSideChange={setPoolSide}
            onLShapeChange={setLShapeSide}
            onDimFocus={setHighlightDim}
            solariums={solariums}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateSolarium={updateSolarium}
            onAddSide={addSolariumSide}
            onRemoveArea={removeSolarium}
            products={products}
          />

          {result && step === 5 && (
            <ResultSummary result={result} products={products} />
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
