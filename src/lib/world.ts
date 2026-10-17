import { Color } from 'three'
import { worldStates, type WorldStateDef, type WorldStateId } from '../data/world'

type ColorKey = {
  [K in keyof WorldStateDef]: WorldStateDef[K] extends string ? K : never
}[keyof WorldStateDef]
type NumberKey = {
  [K in keyof WorldStateDef]: WorldStateDef[K] extends number ? K : never
}[keyof WorldStateDef]

export type WorldValues = { [K in ColorKey]: Color } & { [K in NumberKey]: number }

const COLOR_KEYS: ColorKey[] = [
  'skyTop',
  'skyHorizon',
  'sun',
  'fog',
  'terrainLow',
  'terrainMid',
  'terrainHigh',
  'waterDeep',
  'waterShallow',
  'dust',
]
const NUMBER_KEYS: NumberKey[] = [
  'sunElevation',
  'sunAzimuth',
  'fogDensity',
  'amplitude',
  'dunes',
  'water',
  'stars',
  'aurora',
  'clouds',
  'camHeight',
  'camPitch',
  'exposure',
]

function toValues(def: WorldStateDef): WorldValues {
  const v = {} as WorldValues
  for (const k of COLOR_KEYS) v[k] = new Color(def[k])
  for (const k of NUMBER_KEYS) v[k] = def[k]
  return v
}

export function cloneValues(src: WorldValues): WorldValues {
  const v = {} as WorldValues
  for (const k of COLOR_KEYS) v[k] = src[k].clone()
  for (const k of NUMBER_KEYS) v[k] = src[k]
  return v
}

/** out = mix(a, b, t). Writes into `out` to avoid allocations per frame. */
export function mixValues(out: WorldValues, a: WorldValues, b: WorldValues, t: number) {
  for (const k of COLOR_KEYS) out[k].copy(a[k]).lerp(b[k], t)
  for (const k of NUMBER_KEYS) out[k] = a[k] + (b[k] - a[k]) * t
}

/** Frame rate independent damping of `cur` toward `target`. */
export function dampValues(cur: WorldValues, target: WorldValues, lambda: number, dt: number) {
  const t = 1 - Math.exp(-lambda * dt)
  for (const k of COLOR_KEYS) cur[k].lerp(target[k], t)
  for (const k of NUMBER_KEYS) cur[k] += (target[k] - cur[k]) * t
}

export const presets = Object.fromEntries(
  (Object.keys(worldStates) as WorldStateId[]).map((id) => [id, toValues(worldStates[id])]),
) as Record<WorldStateId, WorldValues>

/**
 * Mutable singleton shared by the DOM (writers) and the render loop (reader).
 * Kept outside React so scrolling never triggers re-renders.
 */
export const world = {
  /** Where the scene is heading, written by the scroll director. */
  target: cloneValues(presets.hero),
  /** Smoothed values the shaders actually read. */
  current: cloneValues(presets.hero),
  /** Optional temporary atmosphere (e.g. hovering a category). */
  override: null as WorldStateId | null,
  overrideMix: 0,
  /** 0 → 1 during the opening descent. */
  intro: 0,
  /** Scroll position in pixels, used to fly the camera forward. */
  scroll: 0,
  /** Normalised pointer, -1..1. */
  pointer: { x: 0, y: 0 },
  /** Set by the DOM when the canvas is fully hidden behind opaque UI. */
  paused: false,
}
