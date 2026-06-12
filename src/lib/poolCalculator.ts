// Módulo puro de cálculo de losetas para piletas.
// Sin React ni Supabase: todas las funciones son puras y testeables.
// Unidades: metros. Origen de coordenadas = esquina superior izquierda de la pileta.

export type PoolShape = 'rect' // futuro: 'lshape' | 'oval'
export type BorderKey = 'recto' | 'ballena5050'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface SolariumArea extends Rect {
  id: string
}

export interface PoolConfig {
  shape: PoolShape
  length: number // m, lado largo (eje X)
  width: number // m, lado corto (eje Y)
  borderKey: BorderKey
  solariums: SolariumArea[]
}

export interface PieceLine {
  productKey: string
  label: string
  baseQty: number
  wasteQty: number
  qty: number
}

export interface CalcResult {
  perimeter: number
  solariumM2: number
  pieces: PieceLine[]
}

export const TILE_SIZE = 0.5 // m — lado de la loseta
export const GRID_SNAP = 0.5 // m — snap del plano
export const WASTE_FACTOR = 0.05
export const CORNER_COUNT = 4
/**
 * Slots de borde (de TILE_SIZE m) que cada pieza ESQUINA ocupa sobre el
 * perímetro y que se descuentan de los bordes rectos.
 * Valor provisorio = 1. Si la esquina ocupa 0,5 m por cada lado, debería ser 2.
 */
export const CORNER_SLOT_DISCOUNT = 1

export const BORDER_LABELS: Record<BorderKey, string> = {
  recto: 'BORDE L 50x50',
  ballena5050: 'BORDE BALLENA 50X50',
}

export const POOL_MIN_SIDE = 2
export const POOL_MAX_SIDE = 20
export const SCENE_MARGIN = 3 // m de escena alrededor de la pileta para solariums
export const SOLARIUM_MIN_SIDE = 0.5
// Un solarium nuevo arranca ocupando una sola loseta
export const SOLARIUM_DEFAULT_SIDE = TILE_SIZE

export const snapToGrid = (v: number, snap: number = GRID_SNAP) =>
  Math.round(v / snap) * snap

export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max)

export const rectsIntersect = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

const withWaste = (baseQty: number): Pick<PieceLine, 'baseQty' | 'wasteQty' | 'qty'> => {
  const wasteQty = Math.ceil(baseQty * WASTE_FACTOR)
  return { baseQty, wasteQty, qty: baseQty + wasteQty }
}

/**
 * Calcula las piezas necesarias para la configuración dada.
 * Caso de referencia: pileta 8×4 → perímetro 24 m → 48 slots →
 * 44 bordes base (+3 desperdicio = 47); 4 esquinas (+1 = 5);
 * solarium 8 m² → 32 losetas (+2 = 34).
 */
export function calculatePool(config: PoolConfig, tileSize: number = TILE_SIZE): CalcResult {
  const { length, width, borderKey, solariums } = config

  const perimeter = 2 * (length + width)
  // round (no ceil): las medidas snapeadas a la grilla garantizan exactitud,
  // round absorbe el error de punto flotante
  const borderSlots = Math.round(perimeter / tileSize)
  const borderBase = Math.max(0, borderSlots - CORNER_COUNT * CORNER_SLOT_DISCOUNT)

  const solariumM2 = solariums.reduce((sum, s) => sum + s.w * s.h, 0)
  const solariumBase = Math.ceil(solariumM2 / (tileSize * tileSize))

  const pieces: PieceLine[] = [
    { productKey: borderKey, label: BORDER_LABELS[borderKey], ...withWaste(borderBase) },
    { productKey: 'esquina', label: 'ESQUINA 50x50', ...withWaste(CORNER_COUNT) },
  ]
  if (solariumBase > 0) {
    pieces.push({ productKey: 'solarium', label: 'SOLARIUM 50x50', ...withWaste(solariumBase) })
  }

  return { perimeter, solariumM2, pieces }
}

/** Query string para pre-cargar /presupuesto: items=recto:47,esquina:5,solarium:34 */
export function buildPresupuestoQuery(result: CalcResult, includeWaste: boolean = true): string {
  const params = new URLSearchParams()
  params.set(
    'items',
    result.pieces.map(p => `${p.productKey}:${includeWaste ? p.qty : p.baseQty}`).join(','),
  )
  return params.toString()
}

/** Límites de la escena donde pueden vivir los solariums. */
export function sceneBounds(length: number, width: number): Rect {
  return {
    x: -SCENE_MARGIN,
    y: -SCENE_MARGIN,
    w: length + 2 * SCENE_MARGIN,
    h: width + 2 * SCENE_MARGIN,
  }
}

/** Pileta + anillo de borde: los solariums van pegados por fuera del anillo. */
export function poolObstacle(pool: { length: number; width: number }): Rect {
  return {
    x: -TILE_SIZE,
    y: -TILE_SIZE,
    w: pool.length + 2 * TILE_SIZE,
    h: pool.width + 2 * TILE_SIZE,
  }
}

/**
 * Restringe un solarium candidato: tamaño mínimo, dentro de la escena,
 * sin superponer la pileta ni otros solariums. Si la posición candidata
 * colisiona, intenta resolver por eje manteniendo la coordenada previa
 * válida; si nada funciona, conserva la posición previa.
 */
export function constrainSolarium(
  candidate: SolariumArea,
  previous: SolariumArea,
  pool: { length: number; width: number },
  others: SolariumArea[],
  scene: Rect = sceneBounds(pool.length, pool.width),
): SolariumArea {
  const obstacles = [poolObstacle(pool), ...others.filter(o => o.id !== candidate.id)]

  const sanitize = (r: SolariumArea): SolariumArea => {
    const w = clamp(snapToGrid(r.w), SOLARIUM_MIN_SIDE, scene.w)
    const h = clamp(snapToGrid(r.h), SOLARIUM_MIN_SIDE, scene.h)
    return {
      ...r,
      w,
      h,
      x: clamp(snapToGrid(r.x), scene.x, scene.x + scene.w - w),
      y: clamp(snapToGrid(r.y), scene.y, scene.y + scene.h - h),
    }
  }

  const collides = (r: Rect) => obstacles.some(o => rectsIntersect(r, o))

  const attempt = sanitize(candidate)
  if (!collides(attempt)) return attempt

  // Resolver por eje: mantener X previa, luego Y previa
  const keepX = sanitize({ ...attempt, x: previous.x })
  if (!collides(keepX)) return keepX
  const keepY = sanitize({ ...attempt, y: previous.y })
  if (!collides(keepY)) return keepY

  return previous
}

/**
 * Busca la posición libre más cercana en la grilla para un área de w×h
 * centrada en (cx, cy). Devuelve null si no hay lugar.
 */
export function findFreeSpot(
  cx: number,
  cy: number,
  w: number,
  h: number,
  pool: { length: number; width: number },
  others: SolariumArea[],
): Rect | null {
  const scene = sceneBounds(pool.length, pool.width)
  const obstacles = [poolObstacle(pool), ...others]

  const tryAt = (x: number, y: number): Rect | null => {
    const r: Rect = {
      x: clamp(snapToGrid(x), scene.x, scene.x + scene.w - w),
      y: clamp(snapToGrid(y), scene.y, scene.y + scene.h - h),
      w,
      h,
    }
    return obstacles.some(o => rectsIntersect(r, o)) ? null : r
  }

  const direct = tryAt(cx - w / 2, cy - h / 2)
  if (direct) return direct

  // Espiral por anillos de la grilla alrededor del punto pedido
  for (let radius = GRID_SNAP; radius <= Math.max(scene.w, scene.h); radius += GRID_SNAP) {
    for (let dx = -radius; dx <= radius; dx += GRID_SNAP) {
      for (let dy = -radius; dy <= radius; dy += GRID_SNAP) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue
        const spot = tryAt(cx - w / 2 + dx, cy - h / 2 + dy)
        if (spot) return spot
      }
    }
  }
  return null
}

/**
 * Reubica los solariums cuando cambian las medidas de la pileta:
 * re-aplica restricciones y, si un área quedó sobre la pileta, busca
 * el lugar libre más cercano; si no hay lugar, la descarta.
 */
export function reconcileSolariums(
  solariums: SolariumArea[],
  pool: { length: number; width: number },
): SolariumArea[] {
  const scene = sceneBounds(pool.length, pool.width)
  const obstacle = poolObstacle(pool)
  const result: SolariumArea[] = []

  for (const s of solariums) {
    const constrained = constrainSolarium(s, s, pool, result, scene)
    const valid =
      !rectsIntersect(constrained, obstacle) &&
      !result.some(o => rectsIntersect(constrained, o))
    if (valid) {
      result.push(constrained)
      continue
    }
    const spot = findFreeSpot(s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, pool, result)
    if (spot) result.push({ ...s, ...spot })
  }
  return result
}
