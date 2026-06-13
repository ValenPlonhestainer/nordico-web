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

// Paths del icon.svg inlineados para compatibilidad con Safari mobile
// (los <image href> externos no se renderizan en iOS Safari dentro de SVG)
const NORDICO_ICON_PATHS = (
  <g transform="translate(0,1254) scale(0.1,-0.1)" fill="rgba(245,244,240,1)" stroke="none">
    <path d="M6125 11344 c-347 -27 -635 -81 -925 -171 -616 -192 -1143 -513 -1591 -969 -344 -351 -554 -652 -746 -1069 -210 -454 -323 -933 -339 -1427 -19 -577 119 -1203 378 -1722 189 -380 439 -720 754 -1026 416 -404 875 -685 1421 -869 699 -235 1399 -269 2098 -101 379 91 797 262 1112 456 398 245 751 566 1042 947 80 106 174 248 259 392 55 94 185 363 218 450 173 465 245 814 261 1270 6 197 -6 401 -38 630 -19 131 -29 183 -80 395 -121 500 -408 1052 -772 1485 -159 189 -435 445 -650 603 -505 373 -1175 634 -1811 708 -128 14 -492 26 -591 18z m620 -84 c428 -55 762 -155 1195 -358 104 -49 338 -184 450 -261 626 -428 1105 -1032 1373 -1728 73 -190 91 -249 141 -453 75 -309 100 -530 100 -865 0 -251 -7 -341 -45 -575 -87 -533 -282 -1022 -577 -1450 -454 -659 -1079 -1139 -1832 -1406 -413 -148 -808 -216 -1245 -217 -544 -1 -994 95 -1540 328 -22 9 -92 43 -155 75 -437 219 -821 524 -1166 925 -415 484 -701 1090 -808 1720 -70 411 -69 835 5 1242 82 459 265 928 507 1298 211 324 410 558 677 794 650 576 1420 894 2315 955 126 9 452 -4 605 -24z" />
    <path d="M4551 9533 c-21 -18 -21 -19 -19 -503 l3 -485 235 -123 c348 -182 579 -302 725 -377 72 -37 162 -84 200 -105 39 -21 147 -77 240 -125 172 -89 460 -240 570 -300 33 -18 116 -61 185 -95 69 -35 163 -84 210 -110 82 -45 699 -364 948 -489 l122 -62 0 -460 0 -459 -542 -2 c-299 -2 -584 -1 -635 2 l-92 5 -67 95 c-136 191 -598 826 -731 1007 -37 50 -114 154 -170 230 -101 138 -102 140 -175 173 -40 18 -277 133 -527 256 -249 123 -459 224 -465 224 -36 0 -36 -3 -36 -1024 0 -551 4 -1007 8 -1014 12 -18 1026 -20 1047 -2 13 11 15 109 15 731 0 396 3 719 8 719 4 0 21 -22 39 -48 17 -26 120 -166 227 -312 108 -146 216 -292 239 -325 24 -33 95 -130 157 -215 63 -85 172 -236 242 -335 71 -99 137 -190 146 -203 l17 -22 663 -1 c493 0 667 3 678 12 20 16 21 991 2 1006 -7 6 -143 77 -303 158 -159 81 -312 160 -340 175 -27 15 -126 67 -220 115 -93 48 -174 91 -180 95 -5 4 -75 40 -155 80 -80 40 -179 92 -220 115 -41 24 -149 81 -240 127 -91 46 -401 208 -690 360 -724 380 -859 451 -977 511 l-103 52 0 447 0 448 298 0 c163 1 401 1 527 1 l230 0 485 -644 c267 -354 538 -715 603 -801 117 -156 137 -172 159 -136 10 16 7 20 -543 750 -155 206 -345 458 -421 560 -76 102 -166 220 -199 263 l-60 77 -549 0 c-507 0 -549 -1 -569 -17z m219 -1863 c91 -46 300 -150 465 -232 l300 -148 3 -725 2 -725 -475 0 -475 0 0 961 c0 528 3 959 8 957 4 -2 81 -41 172 -88z" />
    <path d="M6877 9532 c-16 -17 -17 -83 -17 -745 l0 -727 423 -212 c232 -117 484 -244 560 -282 122 -61 140 -68 162 -58 l25 12 0 1004 c0 984 0 1006 -19 1016 -13 6 -209 10 -569 10 -519 0 -550 -1 -565 -18z m756 -50 l337 -2 0 -955 c0 -525 -1 -955 -2 -955 -2 0 -100 50 -218 111 -118 61 -353 179 -522 262 l-306 152 -1 691 c-1 380 1 693 3 695 5 4 155 4 709 1z" />
    <path d="M3264 3266 c-273 -63 -454 -258 -479 -516 -12 -127 47 -287 143 -392 74 -80 151 -129 259 -164 80 -26 101 -29 228 -29 157 0 194 9 327 77 84 43 175 130 223 212 68 116 86 311 40 441 -59 168 -192 290 -385 355 -84 28 -266 36 -356 16z m349 -65 c183 -63 318 -204 356 -371 13 -58 13 -162 0 -220 -40 -176 -199 -331 -392 -381 -95 -25 -230 -25 -331 1 -289 74 -458 331 -396 605 39 173 225 340 425 382 86 18 264 9 338 -16z" />
    <path d="M3305 3106 c-138 -34 -231 -104 -290 -219 -34 -68 -37 -80 -37 -158 1 -232 163 -393 408 -406 221 -13 380 86 443 275 63 185 -28 386 -213 473 -102 48 -209 60 -311 35z m280 -74 c114 -54 179 -135 205 -254 32 -145 -52 -303 -198 -375 -52 -26 -66 -28 -172 -28 -108 0 -119 2 -181 31 -82 39 -137 88 -172 152 -95 174 -26 377 158 467 103 51 259 54 360 7z" />
    <path d="M8952 3269 c-123 -24 -255 -93 -339 -177 -212 -212 -214 -543 -4 -753 120 -120 275 -178 471 -179 164 0 276 30 403 109 63 40 70 59 36 101 -11 14 -31 42 -45 63 -13 20 -30 37 -37 37 -7 0 -48 -18 -91 -40 -148 -74 -270 -86 -408 -39 -164 55 -262 199 -244 357 14 117 95 229 204 280 49 23 72 27 173 30 132 4 211 -12 298 -59 30 -16 60 -29 67 -29 7 0 34 32 60 72 34 53 44 76 37 88 -27 44 -209 125 -315 140 -76 12 -207 11 -266 -1z m289 -54 c66 -14 239 -86 239 -100 0 -6 -51 -85 -55 -85 -1 0 -31 13 -66 29 -167 76 -353 78 -496 5 -133 -67 -210 -184 -220 -334 -5 -72 -3 -88 21 -150 66 -167 217 -260 426 -260 111 -1 189 17 273 63 l58 32 29 -35 c16 -19 30 -40 30 -46 0 -18 -150 -92 -221 -109 -84 -19 -267 -20 -344 0 -250 63 -408 256 -408 494 1 282 256 508 575 510 48 1 119 -6 159 -14z" />
    <path d="M10456 3260 c-185 -49 -323 -158 -398 -316 -42 -87 -43 -92 -47 -206 -3 -129 7 -176 63 -282 69 -132 229 -247 391 -281 90 -19 250 -19 340 0 160 34 329 160 403 301 170 325 -28 709 -406 789 -99 20 -258 18 -346 -5z m354 -50 c110 -26 194 -75 271 -158 143 -152 178 -348 95 -528 -66 -142 -209 -256 -376 -299 -81 -21 -286 -16 -368 9 -114 36 -227 119 -291 216 -56 82 -72 133 -78 240 -9 163 39 277 166 392 146 132 361 179 581 128z" />
    <path d="M10525 3106 c-91 -19 -154 -54 -221 -121 -81 -80 -107 -145 -108 -270 -1 -81 2 -96 31 -157 66 -139 177 -211 373 -242 66 -11 179 10 254 48 95 47 150 102 195 195 31 67 36 85 35 151 0 176 -117 333 -287 386 -70 21 -199 26 -272 10z m259 -61 c65 -20 104 -45 158 -103 74 -79 83 -102 83 -222 0 -98 -2 -109 -29 -158 -58 -104 -162 -173 -292 -194 -166 -25 -360 64 -424 197 -61 126 -33 304 62 391 51 46 63 54 125 80 48 20 76 24 163 24 64 0 124 -6 154 -15z" />
    <path d="M1317 3253 c-4 -3 -7 -246 -7 -540 l0 -534 118 3 117 3 5 328 5 328 31 -33 c17 -18 89 -100 159 -183 70 -82 180 -210 244 -284 64 -73 120 -140 124 -147 9 -16 142 -20 152 -4 10 15 7 1052 -3 1062 -5 5 -56 7 -113 6 l-104 -3 -5 -315 -5 -315 -105 124 c-126 148 -202 239 -333 394 l-99 117 -87 0 c-48 0 -91 -3 -94 -7z m315 -231 c91 -108 210 -249 263 -312 122 -145 176 -201 187 -194 4 3 8 163 8 355 l0 350 63 -3 62 -3 3 -492 2 -493 -35 0 c-33 0 -44 11 -216 213 -269 314 -450 522 -460 525 -5 2 -9 -158 -9 -365 0 -204 -2 -372 -4 -374 -2 -2 -34 -2 -70 -1 l-66 4 0 494 0 494 53 -1 52 0 167 -197z" />
    <path d="M4572 3248 c-17 -17 -17 -1039 0 -1056 13 -13 217 -17 219 -4 1 4 2 84 4 177 l2 170 99 2 99 3 72 -103 c40 -56 96 -136 125 -177 l53 -75 127 -3 c104 -2 127 0 131 12 4 10 -26 60 -75 128 -44 62 -103 143 -129 180 l-48 67 52 26 c69 35 131 96 158 159 19 41 23 70 24 146 0 84 -3 101 -28 152 -45 91 -140 162 -262 194 -68 18 -605 20 -623 2z m625 -51 c121 -35 213 -124 234 -227 33 -158 -38 -286 -191 -346 -42 -16 -67 -31 -63 -38 3 -6 23 -33 43 -61 21 -27 76 -104 124 -170 l85 -120 -65 -8 c-36 -4 -72 -3 -81 1 -15 9 -44 48 -188 255 l-76 107 -133 0 -133 0 -6 -97 c-4 -54 -7 -136 -7 -183 l0 -85 -62 0 -63 0 -2 485 c-1 267 0 491 2 498 7 19 511 10 582 -11z" />
    <path d="M4749 3104 c-3 -5 -4 -101 -4 -214 l0 -205 190 0 c184 0 192 1 246 26 33 16 68 42 84 63 24 32 29 48 32 114 3 71 2 80 -25 117 -17 25 -49 51 -86 70 -57 29 -61 29 -246 33 -103 3 -189 0 -191 -4z m413 -71 c61 -28 88 -71 88 -140 0 -47 -4 -58 -36 -93 -51 -56 -104 -70 -275 -70 l-137 0 -7 61 c-4 34 -4 108 0 166 l7 105 157 -4 c134 -3 163 -6 203 -25z" />
    <path d="M6093 3248 c-9 -15 -17 -1009 -8 -1045 l5 -23 286 0 c328 0 381 8 506 72 175 90 278 262 278 463 -1 99 -11 148 -54 241 -58 125 -175 223 -328 276 -58 21 -85 22 -370 26 -245 3 -308 1 -315 -10z m627 -53 c191 -50 320 -167 371 -337 27 -88 23 -223 -9 -312 -44 -121 -150 -224 -289 -279 l-78 -31 -260 -6 c-143 -4 -273 -5 -290 -2 l-30 4 0 391 c0 216 1 437 3 492 l2 100 258 -1 c209 -1 269 -4 322 -19z" />
    <path d="M6274 3101 c-2 -2 -4 -174 -4 -382 0 -292 3 -378 13 -381 6 -3 93 -4 192 -2 183 2 227 9 306 49 137 70 215 228 190 383 -19 117 -70 202 -156 261 -85 58 -114 64 -333 70 -112 3 -206 4 -208 2z m369 -56 c124 -26 207 -88 258 -194 18 -37 23 -63 23 -131 0 -99 -19 -152 -80 -219 -81 -91 -178 -121 -391 -121 l-133 0 0 334 0 335 53 4 c121 8 206 6 270 -8z" />
    <path d="M7675 3248 c-3 -7 -4 -249 -3 -538 l3 -525 115 0 115 0 0 535 0 535 -113 3 c-84 2 -114 -1 -117 -10z m180 -529 l0 -494 -65 0 -65 0 -3 485 c-1 267 0 490 2 495 2 6 32 10 67 9 l64 0 0 -495z" />
  </g>
)

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
    // En táctil sin solarium seleccionado, no agregar desde el fondo — solo desde los botones
    if (e.pointerType === 'touch' && !selectedId) return
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
    <g key="watermark" pointerEvents="none" opacity={0.1}
      transform={`translate(${watCx - watSize / 2} ${watCy - watSize / 2}) scale(${watSize / 1254})`}>
      {NORDICO_ICON_PATHS}
    </g>
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
