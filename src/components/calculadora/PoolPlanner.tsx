'use client'
import { useEffect, useRef, useState } from 'react'
import {
  GRID_SNAP,
  SCENE_MARGIN,
  SOLARIUM_MIN_SIDE,
  TILE_SIZE,
  snapToGrid,
  type SolariumArea,
} from '@/lib/poolCalculator'

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

type DragState =
  | { mode: 'idle' }
  | { mode: 'move'; id: string; grabDX: number; grabDY: number }
  | { mode: 'resize'; id: string; handle: Handle }

interface PoolPlannerProps {
  length: number
  width: number
  solariums: SolariumArea[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (next: SolariumArea) => void
  onAddAt: (x: number, y: number) => void
  onExtendTo: (x: number, y: number) => void
  interactive: boolean
}

const fmtM = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const cursorFor = (h: Handle) => {
  if (h === 'nw' || h === 'se') return 'nwse-resize'
  if (h === 'ne' || h === 'sw') return 'nesw-resize'
  if (h === 'n' || h === 's') return 'ns-resize'
  return 'ew-resize'
}

function resizeRect(area: SolariumArea, handle: Handle, px: number, py: number): SolariumArea {
  const right = area.x + area.w
  const bottom = area.y + area.h
  let { x, y, w, h } = area
  const sx = snapToGrid(px)
  const sy = snapToGrid(py)
  if (handle.includes('e')) w = Math.max(SOLARIUM_MIN_SIDE, sx - area.x)
  if (handle.includes('s')) h = Math.max(SOLARIUM_MIN_SIDE, sy - area.y)
  if (handle.includes('w')) {
    x = Math.min(sx, right - SOLARIUM_MIN_SIDE)
    w = right - x
  }
  if (handle.includes('n')) {
    y = Math.min(sy, bottom - SOLARIUM_MIN_SIDE)
    h = bottom - y
  }
  return { ...area, x, y, w, h }
}

// Esquina del solarium más alejada del centro de la pileta: ahí va la
// manija grande de redimensionar (es la esquina "libre", lejos del anillo)
const farCorner = (a: SolariumArea, poolCx: number, poolCy: number): [Handle, number, number] => {
  const corners: [Handle, number, number][] = [
    ['nw', a.x, a.y],
    ['ne', a.x + a.w, a.y],
    ['sw', a.x, a.y + a.h],
    ['se', a.x + a.w, a.y + a.h],
  ]
  return corners.reduce((best, c) =>
    (c[1] - poolCx) ** 2 + (c[2] - poolCy) ** 2 >
    (best[1] - poolCx) ** 2 + (best[2] - poolCy) ** 2
      ? c
      : best,
  )
}

const handlePositions = (a: SolariumArea): [Handle, number, number][] => [
  ['nw', a.x, a.y],
  ['n', a.x + a.w / 2, a.y],
  ['ne', a.x + a.w, a.y],
  ['e', a.x + a.w, a.y + a.h / 2],
  ['se', a.x + a.w, a.y + a.h],
  ['s', a.x + a.w / 2, a.y + a.h],
  ['sw', a.x, a.y + a.h],
  ['w', a.x, a.y + a.h / 2],
]

export default function PoolPlanner(props: PoolPlannerProps) {
  const { length, width, solariums, selectedId, onSelect, onUpdate, onAddAt, onExtendTo, interactive } = props

  const svgRef = useRef<SVGSVGElement>(null)
  const [drag, setDrag] = useState<DragState>({ mode: 'idle' })
  const [pxScale, setPxScale] = useState(50)
  const [expanded, setExpanded] = useState(false)

  const M = SCENE_MARGIN
  const T = TILE_SIZE
  const vb = { x: -M, y: -M, w: length + 2 * M, h: width + 2 * M }

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const update = () => {
      if (svg.clientWidth > 0) setPxScale(svg.clientWidth / (length + 2 * SCENE_MARGIN))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(svg)
    return () => ro.disconnect()
  }, [length])

  // Escape: primero cierra pantalla completa, después deselecciona
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (expanded) setExpanded(false)
      else if (selectedId) onSelect(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expanded, selectedId, onSelect])

  const px = (n: number) => n / pxScale // n píxeles expresados en metros

  // El SVG raíz se obtiene desde el evento (no desde el ref) para no
  // acceder a refs dentro de funciones creadas durante el render
  const svgOf = (e: React.PointerEvent): SVGSVGElement | null => {
    const el = e.currentTarget as Element
    return el instanceof SVGSVGElement ? el : (el as SVGGraphicsElement).ownerSVGElement
  }

  const toMeters = (e: React.PointerEvent) => {
    const svg = svgOf(e)
    const ctm = svg?.getScreenCTM()
    if (!ctm) return null
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    return { x: pt.x, y: pt.y }
  }

  const onBackgroundPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return
    e.preventDefault()
    const m = toMeters(e)
    if (!m) return
    // Con un solarium seleccionado, tocar la grilla lo estira hasta esa celda
    if (selectedId) onExtendTo(m.x, m.y)
    else onAddAt(m.x, m.y)
  }

  const onAreaPointerDown = (e: React.PointerEvent, area: SolariumArea) => {
    if (!interactive) return
    e.preventDefault()
    e.stopPropagation()
    onSelect(area.id)
    const m = toMeters(e)
    if (!m) return
    setDrag({ mode: 'move', id: area.id, grabDX: m.x - area.x, grabDY: m.y - area.y })
    svgOf(e)?.setPointerCapture(e.pointerId)
  }

  const onHandlePointerDown = (e: React.PointerEvent, area: SolariumArea, handle: Handle) => {
    if (!interactive) return
    e.preventDefault()
    e.stopPropagation()
    setDrag({ mode: 'resize', id: area.id, handle })
    svgOf(e)?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (drag.mode === 'idle') return
    const m = toMeters(e)
    if (!m) return
    const area = solariums.find(s => s.id === drag.id)
    if (!area) return
    if (drag.mode === 'move') {
      onUpdate({ ...area, x: snapToGrid(m.x - drag.grabDX), y: snapToGrid(m.y - drag.grabDY) })
    } else {
      onUpdate(resizeRect(area, drag.handle, m.x, m.y))
    }
  }

  const endDrag = () => setDrag({ mode: 'idle' })

  const dimColor = 'rgba(255,255,255,0.4)'
  const dimY = width + T + 0.7
  const dimX = length + T + 0.7
  const tick = 0.15
  const handleSize = px(11)
  const handleHit = px(44)

  const svgEl = (
    <svg
      ref={svgRef}
      className="calc-svg"
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      preserveAspectRatio="xMidYMid meet"
      style={{
        aspectRatio: expanded ? undefined : `${vb.w} / ${vb.h}`,
        touchAction: 'none',
        ...(expanded ? { width: '100%', height: '100%' } : {}),
      }}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <defs>
        <pattern id="calcGridMinor" width={GRID_SNAP} height={GRID_SNAP} patternUnits="userSpaceOnUse">
          <path
            d={`M ${GRID_SNAP} 0 L 0 0 0 ${GRID_SNAP}`}
            fill="none"
            stroke="rgba(255,255,255,0.045)"
            strokeWidth={px(1)}
          />
        </pattern>
        <pattern id="calcGridMajor" width={1} height={1} patternUnits="userSpaceOnUse">
          <path
            d="M 1 0 L 0 0 0 1"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={px(1)}
          />
        </pattern>
        <pattern id="calcTicks" width={T} height={T} patternUnits="userSpaceOnUse">
          <path
            d={`M ${T} 0 L 0 0 0 ${T}`}
            fill="none"
            stroke="rgba(232,82,26,0.3)"
            strokeWidth={px(1)}
          />
        </pattern>
      </defs>

      {/* Fondo + grilla (el fondo captura el click para agregar/deseleccionar) */}
      <rect
        x={vb.x} y={vb.y} width={vb.w} height={vb.h}
        fill="var(--dark)"
        onPointerDown={onBackgroundPointerDown}
        style={{ cursor: interactive ? (selectedId ? 'crosshair' : 'copy') : 'default' }}
      />
      <g pointerEvents="none">
        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#calcGridMinor)" />
        <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#calcGridMajor)" />
      </g>

      {/* Anillo de borde atérmico alrededor de la pileta */}
      <g pointerEvents="none">
        {([
          [-T, -T, length + 2 * T, T],
          [-T, width, length + 2 * T, T],
          [-T, 0, T, width],
          [length, 0, T, width],
        ] as const).map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill="rgba(232,82,26,0.1)" />
            <rect x={x} y={y} width={w} height={h} fill="url(#calcTicks)" />
          </g>
        ))}
        {/* Piezas de esquina */}
        {([
          [-T, -T], [length, -T], [-T, width], [length, width],
        ] as const).map(([x, y], i) => (
          <rect
            key={i}
            x={x} y={y} width={T} height={T}
            fill="rgba(232,82,26,0.32)"
            stroke="rgba(232,82,26,0.6)"
            strokeWidth={px(1)}
          />
        ))}
      </g>

      {/* Pileta */}
      <g pointerEvents="none">
        <rect
          x={0} y={0} width={length} height={width}
          fill="#16323F"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={px(1.5)}
        />
        <text
          x={length / 2} y={width / 2 - px(4)}
          textAnchor="middle"
          fontSize={px(15)}
          fontFamily="var(--font-display)"
          fontWeight={700}
          letterSpacing={px(2)}
          fill="rgba(245,244,240,0.85)"
        >
          PILETA
        </text>
        <text
          x={length / 2} y={width / 2 + px(14)}
          textAnchor="middle"
          fontSize={px(12)}
          fontFamily="var(--font-body)"
          fill="rgba(245,244,240,0.55)"
        >
          {fmtM(length)} × {fmtM(width)} m
        </text>
      </g>

      {/* Cotas */}
      <g pointerEvents="none" stroke={dimColor} strokeWidth={px(1)}>
        <line x1={0} y1={dimY} x2={length} y2={dimY} />
        <line x1={0} y1={dimY - tick} x2={0} y2={dimY + tick} />
        <line x1={length} y1={dimY - tick} x2={length} y2={dimY + tick} />
        <line x1={dimX} y1={0} x2={dimX} y2={width} />
        <line x1={dimX - tick} y1={0} x2={dimX + tick} y2={0} />
        <line x1={dimX - tick} y1={width} x2={dimX + tick} y2={width} />
      </g>
      <g pointerEvents="none" fill={dimColor} fontFamily="var(--font-body)" fontSize={px(12)}>
        <text x={length / 2} y={dimY + px(16)} textAnchor="middle">{fmtM(length)} m</text>
        <text
          x={dimX} y={width / 2}
          textAnchor="middle"
          transform={`rotate(90 ${dimX + px(16)} ${width / 2})`}
        >
          {fmtM(width)} m
        </text>
      </g>

      {/* Solariums */}
      {solariums.map(area => {
        const isSelected = area.id === selectedId
        const showLabel = area.w * pxScale > 55 && area.h * pxScale > 30
        const hit = Math.min(handleHit, Math.min(area.w, area.h) / 2)
        const knob = Math.min(handleSize, Math.min(area.w, area.h) / 3)
        return (
          <g key={area.id}>
            <rect
              x={area.x} y={area.y} width={area.w} height={area.h}
              fill={isSelected ? 'rgba(232,82,26,0.22)' : 'rgba(232,82,26,0.14)'}
              stroke="var(--orange)"
              strokeWidth={px(isSelected ? 2 : 1.2)}
              strokeDasharray={isSelected ? undefined : `${px(5)} ${px(4)}`}
              style={{ cursor: interactive ? 'move' : 'default' }}
              onPointerDown={e => onAreaPointerDown(e, area)}
            />
            {/* Grilla de losetas dentro del solarium */}
            <rect
              x={area.x} y={area.y} width={area.w} height={area.h}
              fill="url(#calcTicks)"
              pointerEvents="none"
            />
            {showLabel && (
              <g pointerEvents="none" textAnchor="middle" fontFamily="var(--font-body)">
                <text
                  x={area.x + area.w / 2} y={area.y + area.h / 2 - px(2)}
                  fontSize={px(11)}
                  fill="rgba(245,244,240,0.9)"
                >
                  {fmtM(area.w)} × {fmtM(area.h)} m
                </text>
                <text
                  x={area.x + area.w / 2} y={area.y + area.h / 2 + px(12)}
                  fontSize={px(10)}
                  fill="rgba(245,244,240,0.55)"
                >
                  {fmtM(area.w * area.h)} m²
                </text>
              </g>
            )}
            {isSelected && interactive && (
              handlePositions(area).map(([handle, cx, cy]) => (
                <g key={handle}>
                  <rect
                    x={cx - knob / 2} y={cy - knob / 2}
                    width={knob} height={knob}
                    fill="var(--orange)"
                    pointerEvents="none"
                  />
                  <rect
                    x={cx - hit / 2} y={cy - hit / 2}
                    width={hit} height={hit}
                    fill="transparent"
                    style={{ cursor: cursorFor(handle) }}
                    onPointerDown={e => onHandlePointerDown(e, area, handle)}
                  />
                </g>
              ))
            )}
            {/* Manija grande de esquina (estilo Piasstra), clave en táctil */}
            {isSelected && interactive && (() => {
              const [h, cx, cy] = farCorner(area, length / 2, width / 2)
              const r = px(15)
              const arm = px(7)
              const head = px(3.5)
              const angle = h === 'ne' || h === 'sw' ? -45 : 45
              return (
                <g>
                  <g pointerEvents="none">
                    <circle
                      cx={cx} cy={cy} r={r}
                      fill="var(--dark)"
                      stroke="var(--orange)"
                      strokeWidth={px(2)}
                    />
                    <g
                      transform={`translate(${cx} ${cy}) rotate(${angle})`}
                      stroke="var(--orange)"
                      strokeWidth={px(2)}
                      strokeLinecap="round"
                      fill="none"
                    >
                      <line x1={-arm} y1={0} x2={arm} y2={0} />
                      <path d={`M ${arm - head} ${-head} L ${arm} 0 L ${arm - head} ${head}`} />
                      <path d={`M ${head - arm} ${-head} L ${-arm} 0 L ${head - arm} ${head}`} />
                    </g>
                  </g>
                  <circle
                    cx={cx} cy={cy} r={px(22)}
                    fill="transparent"
                    style={{ cursor: cursorFor(h) }}
                    onPointerDown={e => onHandlePointerDown(e, area, h)}
                  />
                </g>
              )
            })()}
          </g>
        )
      })}
    </svg>
  )

  return (
    <div className={`calc-planner-wrap${expanded ? ' expanded' : ''}`}>
      {expanded && (
        <div className="calc-expand-bar">
          <span className="calc-expand-title">PLANO INTERACTIVO</span>
          <button className="calc-expand-close" onClick={() => setExpanded(false)}>
            ✕ CERRAR
          </button>
        </div>
      )}
      {svgEl}
      {!expanded && interactive && (
        <button
          className="calc-expand-btn"
          onClick={() => setExpanded(true)}
          aria-label="Ver en pantalla completa"
        >
          ⤢
        </button>
      )}
      {expanded && (
        <p className="calc-expand-hint-bar">
          TOCÁ EL PLANO PARA AGREGAR · ARRASTRÁ PARA MOVER · ESTIRÁ DESDE LOS PUNTOS
        </p>
      )}
    </div>
  )
}
