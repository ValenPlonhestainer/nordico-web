'use client'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  GRID_SNAP,
  ROMANO_RADII,
  SCENE_MARGIN,
  SOLARIUM_MIN_SIDE,
  TILE_SIZE,
  snapToGrid,
  type PoolShape,
  type RomanoKey,
  type SolariumArea,
} from '@/lib/poolCalculator'

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

type DragState =
  | { mode: 'idle' }
  | { mode: 'move'; id: string; grabDX: number; grabDY: number }
  | { mode: 'resize'; id: string; handle: Handle }

interface PoolPlannerProps {
  shape: PoolShape
  length: number
  width: number
  length2: number
  width2: number
  romanoKey: RomanoKey
  solariums: SolariumArea[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (next: SolariumArea) => void
  onAddAt: (x: number, y: number) => void
  onExtendTo: (x: number, y: number) => void
  interactive: boolean
  highlightDim?: 'length' | 'width' | 'length2' | 'width2' | null
  highlightProduct?: string | null
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
  const { shape, length, width, length2, width2, romanoKey, solariums, selectedId, onSelect, onUpdate, onAddAt, onExtendTo, interactive, highlightDim, highlightProduct } = props

  // Opacidades para el hover de productos en el resumen
  const isBorderKey = (k: string | null | undefined) =>
    k === 'recto' || k === 'ballena5050' || k === 'ballena4050' || k === 'bordeballenal50x50'
  const anyHl = !!highlightProduct
  const hlStrips = anyHl && isBorderKey(highlightProduct)
  const hlCorners = anyHl && highlightProduct === 'esquina50x50'
  const hlArc = anyHl && (highlightProduct === 'borderomano2mts' || highlightProduct === 'borderomano3mts')
  const hlSolarium = anyHl && highlightProduct === 'solarium'
  const tr = 'opacity 0.15s'
  const oStrips  = anyHl ? (hlStrips   ? 1 : 0.12) : 1
  const oCorners = anyHl ? (hlCorners  ? 1 : 0.12) : 1
  const oArc     = anyHl ? (hlArc      ? 1 : 0.12) : 1
  const oSolarium= anyHl ? (hlSolarium ? 1 : 0.12) : 1

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
    // `expanded` se incluye porque al portalear el overlay el <svg> se
    // re-monta como otro nodo: hay que re-observar el nuevo y recalcular escala
  }, [length, expanded])

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

  // Marca de agua Nordico — usa icon.svg invertido a blanco (estilo CAD/blueprint)
  const watSize = Math.min(length, width) * 0.42
  const watCx = length / 2
  const watCy = width / 2
  const nordicoMark = (
    <image
      key="watermark"
      href="/icon.svg"
      x={watCx - watSize / 2}
      y={watCy - watSize / 2}
      width={watSize}
      height={watSize}
      pointerEvents="none"
      style={{ filter: 'invert(1)', opacity: 0.1 }}
    />
  )

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
        {/* Losetas individuales para solariums: cada celda T×T con junta visible */}
        <pattern id="calcSolariumTile" width={T} height={T} patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={T} height={T} fill="rgba(232,82,26,0.08)" />
          <rect x={px(1.5)} y={px(1.5)} width={T - px(3)} height={T - px(3)} fill="rgba(232,82,26,0.28)" />
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

      {/* Anillo de borde atérmico + pileta — varía según la forma */}
      {shape === 'lshape' ? (() => {
        const lx = length - length2
        const wy = width - width2
        // 6 strips de borde (una por cada arista del L) + 5 esquinas convexas
        const strips: [number, number, number, number][] = [
          [0, -T, lx, T],            // arista top
          [lx, 0, T, wy],            // arista interior derecha (baja)
          [lx, wy - T, length2, T],  // arista interior horizontal (estante)
          [length, wy, T, width - wy], // arista derecha exterior (baja)
          [0, width, length, T],     // arista bottom
          [-T, 0, T, width],         // arista izquierda
        ]
        const convexCorners: [number, number][] = [
          [-T, -T],           // esquina A: top-left
          [lx, -T],           // esquina B: top del escalón
          [length, wy - T],   // esquina D: top-right del tramo bajo
          [length, width],    // esquina E: bottom-right
          [-T, width],        // esquina F: bottom-left
        ]
        const poolPoints = `0,0 ${lx},0 ${lx},${wy} ${length},${wy} ${length},${width} 0,${width}`
        return (
          <g pointerEvents="none">
            <g style={{ opacity: oStrips, transition: tr }}>
              {strips.map(([x, y, w, h], i) => (
                <g key={i}>
                  <rect x={x} y={y} width={w} height={h} fill="rgba(232,82,26,0.1)" />
                  <rect x={x} y={y} width={w} height={h} fill="url(#calcTicks)" />
                </g>
              ))}
            </g>
            <g style={{ opacity: oCorners, transition: tr }}>
              {convexCorners.map(([x, y], i) => (
                <rect key={i} x={x} y={y} width={T} height={T}
                  fill="rgba(232,82,26,0.32)" stroke="rgba(232,82,26,0.6)" strokeWidth={px(1)} />
              ))}
            </g>
            <polygon points={poolPoints} fill="#16323F" stroke="rgba(255,255,255,0.18)" strokeWidth={px(1.5)} />
            {/* Resalte de aristas del recorte */}
            {highlightDim === 'length2' && (
              <g pointerEvents="none">
                <line x1={lx} y1={wy} x2={length} y2={wy}
                  stroke="var(--orange)" strokeWidth={px(3)} strokeLinecap="round" />
                <line x1={lx} y1={wy + 0.4} x2={length} y2={wy + 0.4} stroke="var(--orange)" strokeWidth={px(1)} />
                <line x1={lx} y1={wy + 0.25} x2={lx} y2={wy + 0.55} stroke="var(--orange)" strokeWidth={px(1)} />
                <line x1={length} y1={wy + 0.25} x2={length} y2={wy + 0.55} stroke="var(--orange)" strokeWidth={px(1)} />
                <text x={lx + length2 / 2} y={wy + 0.4 + px(16)} textAnchor="middle"
                  fill="var(--orange)" fontSize={px(13)} fontWeight={700} fontFamily="var(--font-body)">
                  {fmtM(length2)} m
                </text>
              </g>
            )}
            {highlightDim === 'width2' && (
              <g pointerEvents="none">
                <line x1={lx} y1={0} x2={lx} y2={wy}
                  stroke="var(--orange)" strokeWidth={px(3)} strokeLinecap="round" />
                <line x1={lx + 0.4} y1={0} x2={lx + 0.4} y2={wy} stroke="var(--orange)" strokeWidth={px(1)} />
                <line x1={lx + 0.25} y1={0} x2={lx + 0.55} y2={0} stroke="var(--orange)" strokeWidth={px(1)} />
                <line x1={lx + 0.25} y1={wy} x2={lx + 0.55} y2={wy} stroke="var(--orange)" strokeWidth={px(1)} />
                <text x={lx + 0.4} y={wy / 2} textAnchor="middle"
                  transform={`rotate(90 ${lx + 0.4 + px(16)} ${wy / 2})`}
                  fill="var(--orange)" fontSize={px(13)} fontWeight={700} fontFamily="var(--font-body)">
                  {fmtM(width2)} m
                </text>
              </g>
            )}
            {nordicoMark}
            <text x={(lx) / 2} y={watCy + watSize / 2 + px(18)} textAnchor="middle"
              fontSize={px(15)} fontFamily="var(--font-display)" fontWeight={700}
              letterSpacing={px(2)} fill="rgba(245,244,240,0.85)">
              PILETA
            </text>
            <text x={(lx) / 2} y={watCy + watSize / 2 + px(34)} textAnchor="middle"
              fontSize={px(12)} fontFamily="var(--font-body)" fill="rgba(245,244,240,0.55)">
              {fmtM(length)} × {fmtM(width)} m
            </text>
          </g>
        )
      })() : shape === 'arco' ? (() => {
        const R = ROMANO_RADII[romanoKey]
        // El arco está centrado en (length, cy) — el lado derecho del rectángulo principal
        const cy = width / 2
        const arcTopY = Math.max(0, cy - R)
        const arcBotY = Math.min(width, cy + R)
        const hasShoulders = width > 2 * R + 0.001

        // Strips de borde recto
        const straightStrips: [number, number, number, number][] = [
          [0, -T, length, T],
          [-T, 0, T, width],
          [0, width, length, T],
          ...(hasShoulders ? [
            [length, 0, T, arcTopY] as [number, number, number, number],
            [length, arcBotY, T, width - arcBotY] as [number, number, number, number],
          ] : []),
        ]

        // Piezas individuales de cuña: abanico de θ=-π/2 (arriba) a θ=π/2 (abajo) pasando por 0° (derecha)
        const numPieces = Math.ceil(Math.PI * R / T)
        const wedgePaths: string[] = []
        for (let i = 0; i < numPieces; i++) {
          const θ1 = -Math.PI / 2 + i * (Math.PI / numPieces)
          const θ2 = -Math.PI / 2 + (i + 1) * (Math.PI / numPieces)
          const xi1 = length + R * Math.cos(θ1);         const yi1 = cy + R * Math.sin(θ1)
          const xi2 = length + R * Math.cos(θ2);         const yi2 = cy + R * Math.sin(θ2)
          const xo1 = length + (R + T) * Math.cos(θ1);  const yo1 = cy + (R + T) * Math.sin(θ1)
          const xo2 = length + (R + T) * Math.cos(θ2);  const yo2 = cy + (R + T) * Math.sin(θ2)
          // sweep=1 (CW en SVG) va hacia la derecha para este arco
          wedgePaths.push(
            `M ${xi1} ${yi1} A ${R} ${R} 0 0 1 ${xi2} ${yi2} L ${xo2} ${yo2} A ${R + T} ${R + T} 0 0 0 ${xo1} ${yo1} Z`
          )
        }

        const corners: [number, number][] = [
          [-T, -T], [-T, width],
          ...(hasShoulders ? [[length, -T], [length, width]] as [number, number][] : []),
        ]

        return (
          <g pointerEvents="none">
            {/* Borde recto */}
            <g style={{ opacity: oStrips, transition: tr }}>
              {straightStrips.map(([x, y, w, h], i) => (
                <g key={i}>
                  <rect x={x} y={y} width={w} height={h} fill="rgba(232,82,26,0.1)" />
                  <rect x={x} y={y} width={w} height={h} fill="url(#calcTicks)" />
                </g>
              ))}
            </g>
            {/* Cuñas del arco romano — piezas individuales */}
            <g style={{ opacity: oArc, transition: tr }}>
              {wedgePaths.map((d, i) => (
                <path key={i} d={d}
                  fill="rgba(232,82,26,0.15)" stroke="rgba(232,82,26,0.6)" strokeWidth={px(1)} />
              ))}
            </g>
            {/* Esquinas */}
            <g style={{ opacity: oCorners, transition: tr }}>
              {corners.map(([x, y], i) => (
                <rect key={i} x={x} y={y} width={T} height={T}
                  fill="rgba(232,82,26,0.32)" stroke="rgba(232,82,26,0.6)" strokeWidth={px(1)} />
              ))}
            </g>
            {/* Pileta: rect + círculo del arco por separado para garantizar el relleno */}
            <rect x={0} y={0} width={length} height={width} fill="#16323F" />
            <circle cx={length} cy={cy} r={R} fill="#16323F" />
            {/* Contorno de la pileta */}
            <line x1={0} y1={0} x2={length} y2={0} stroke="rgba(255,255,255,0.18)" strokeWidth={px(1.5)} />
            <line x1={0} y1={0} x2={0} y2={width} stroke="rgba(255,255,255,0.18)" strokeWidth={px(1.5)} />
            <line x1={0} y1={width} x2={length} y2={width} stroke="rgba(255,255,255,0.18)" strokeWidth={px(1.5)} />
            {hasShoulders && <>
              <line x1={length} y1={0} x2={length} y2={arcTopY} stroke="rgba(255,255,255,0.18)" strokeWidth={px(1.5)} />
              <line x1={length} y1={arcBotY} x2={length} y2={width} stroke="rgba(255,255,255,0.18)" strokeWidth={px(1.5)} />
            </>}
            <path d={`M ${length} ${arcTopY} A ${R} ${R} 0 0 1 ${length} ${arcBotY}`}
              fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={px(1.5)} />
            {/* Label */}
            {nordicoMark}
            <text x={length / 2} y={watCy + watSize / 2 + px(18)} textAnchor="middle"
              fontSize={px(15)} fontFamily="var(--font-display)" fontWeight={700}
              letterSpacing={px(2)} fill="rgba(245,244,240,0.85)">
              PILETA
            </text>
            <text x={length / 2} y={watCy + watSize / 2 + px(34)} textAnchor="middle"
              fontSize={px(12)} fontFamily="var(--font-body)" fill="rgba(245,244,240,0.55)">
              {fmtM(length)} × {fmtM(width)} m
            </text>
          </g>
        )
      })() : (
        /* Rectangular — original */
        <g pointerEvents="none">
          <g style={{ opacity: oStrips, transition: tr }}>
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
          </g>
          <g style={{ opacity: oCorners, transition: tr }}>
            {([
              [-T, -T], [length, -T], [-T, width], [length, width],
            ] as const).map(([x, y], i) => (
              <rect key={i} x={x} y={y} width={T} height={T}
                fill="rgba(232,82,26,0.32)" stroke="rgba(232,82,26,0.6)" strokeWidth={px(1)} />
            ))}
          </g>
          <rect x={0} y={0} width={length} height={width}
            fill="#16323F" stroke="rgba(255,255,255,0.18)" strokeWidth={px(1.5)} />
          {nordicoMark}
          <text x={length / 2} y={watCy + watSize / 2 + px(18)} textAnchor="middle"
            fontSize={px(15)} fontFamily="var(--font-display)" fontWeight={700}
            letterSpacing={px(2)} fill="rgba(245,244,240,0.85)">
            PILETA
          </text>
          <text x={length / 2} y={watCy + watSize / 2 + px(34)} textAnchor="middle"
            fontSize={px(12)} fontFamily="var(--font-body)" fill="rgba(245,244,240,0.55)">
            {fmtM(length)} × {fmtM(width)} m
          </text>
        </g>
      )}

      {/* Cotas (se resaltan al enfocar el input de esa medida) */}
      {(() => {
        const hlLen = highlightDim === 'length'
        const hlWid = highlightDim === 'width'
        const lenC = hlLen ? 'var(--orange)' : dimColor
        const widC = hlWid ? 'var(--orange)' : dimColor
        return (
          <g pointerEvents="none" fontFamily="var(--font-body)">
            {/* Arista de la pileta resaltada junto a la cota activa */}
            {hlLen && (
              <line
                x1={0} y1={width} x2={length} y2={width}
                stroke="var(--orange)" strokeWidth={px(3)} strokeLinecap="round"
              />
            )}
            {hlWid && (
              <line
                x1={0} y1={0} x2={0} y2={width}
                stroke="var(--orange)" strokeWidth={px(3)} strokeLinecap="round"
              />
            )}

            {/* Cota de LARGO (abajo) */}
            <g stroke={lenC} strokeWidth={px(hlLen ? 2 : 1)}>
              <line x1={0} y1={dimY} x2={length} y2={dimY} />
              <line x1={0} y1={dimY - tick} x2={0} y2={dimY + tick} />
              <line x1={length} y1={dimY - tick} x2={length} y2={dimY + tick} />
            </g>
            <text
              x={length / 2} y={dimY + px(16)} textAnchor="middle"
              fill={lenC} fontSize={px(hlLen ? 13 : 12)} fontWeight={hlLen ? 700 : 400}
            >
              {fmtM(length)} m
            </text>

            {/* Cota de ANCHO (izquierda) */}
            {(() => {
              const dxL = -(T + 0.7)
              return (
                <>
                  <g stroke={widC} strokeWidth={px(hlWid ? 2 : 1)}>
                    <line x1={dxL} y1={0} x2={dxL} y2={width} />
                    <line x1={dxL - tick} y1={0} x2={dxL + tick} y2={0} />
                    <line x1={dxL - tick} y1={width} x2={dxL + tick} y2={width} />
                  </g>
                  <text
                    x={dxL} y={width / 2} textAnchor="middle"
                    transform={`rotate(90 ${dxL - px(16)} ${width / 2})`}
                    fill={widC} fontSize={px(hlWid ? 13 : 12)} fontWeight={hlWid ? 700 : 400}
                  >
                    {fmtM(width)} m
                  </text>
                </>
              )
            })()}
          </g>
        )
      })()}

      {/* Solariums */}
      {solariums.map(area => {
        const isSelected = area.id === selectedId
        const solOpacity = hlSolarium ? 1 : anyHl ? 0.12 : 1
        const showLabel = area.w * pxScale > 55 && area.h * pxScale > 30
        const hit = Math.min(handleHit, Math.min(area.w, area.h) / 2)
        const knob = Math.min(handleSize, Math.min(area.w, area.h) / 3)
        return (
          <g key={area.id} style={{ opacity: solOpacity, transition: tr }}>
            {/* Losetas individuales del solarium */}
            <rect
              x={area.x} y={area.y} width={area.w} height={area.h}
              fill="url(#calcSolariumTile)"
              pointerEvents="none"
            />
            {/* Contorno interactivo (selección / hover) */}
            <rect
              x={area.x} y={area.y} width={area.w} height={area.h}
              fill={isSelected ? 'rgba(232,82,26,0.12)' : 'none'}
              stroke="var(--orange)"
              strokeWidth={px(isSelected ? 2 : 1.2)}
              strokeDasharray={isSelected ? undefined : `${px(5)} ${px(4)}`}
              style={{ cursor: interactive ? 'move' : 'default' }}
              onPointerDown={e => onAreaPointerDown(e, area)}
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

  // El overlay de pantalla completa se portalea al <body> para escapar de
  // `.calc-planner-col` (que en el paso 4 es position: sticky): en iOS Safari
  // un position: fixed dentro de un sticky se descoloca y la barra de cerrar
  // quedaba fuera de alcance. Portaleado, el fixed es relativo al viewport.
  const expandedOverlay = (
    <div className="calc-planner-wrap expanded">
      <div className="calc-expand-bar">
        <span className="calc-expand-title">PLANO INTERACTIVO</span>
        <button
          type="button"
          className="calc-expand-close"
          onClick={() => setExpanded(false)}
        >
          ✕ CERRAR
        </button>
      </div>
      {svgEl}
      <p className="calc-expand-hint-bar">
        TOCÁ EL PLANO PARA AGREGAR · ARRASTRÁ PARA MOVER · ESTIRÁ DESDE LOS PUNTOS
      </p>
    </div>
  )

  return (
    <div className="calc-planner-wrap">
      {!expanded && svgEl}
      {!expanded && interactive && (
        <button
          type="button"
          className="calc-expand-btn"
          onClick={() => setExpanded(true)}
          aria-label="Ver en pantalla completa"
        >
          ⤢
        </button>
      )}
      {expanded && typeof document !== 'undefined' &&
        createPortal(expandedOverlay, document.body)}
    </div>
  )
}
