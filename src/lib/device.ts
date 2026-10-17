export type QualityTier = 'high' | 'low'

export interface Quality {
  tier: QualityTier
  dpr: [number, number]
  terrainSegments: number
  dust: number
  cloudLayers: number
}

function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 'high'
  const params = new URLSearchParams(window.location.search)
  const forced = params.get('quality')
  if (forced === 'high' || forced === 'low') return forced
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = Math.min(window.innerWidth, window.innerHeight) < 700
  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
  if (coarse || small || cores <= 4 || memory <= 4) return 'low'
  return 'high'
}

export function getQuality(): Quality {
  const tier = detectTier()
  return tier === 'high'
    ? { tier, dpr: [1, 1.75], terrainSegments: 240, dust: 900, cloudLayers: 6 }
    : { tier, dpr: [1, 1.35], terrainSegments: 128, dust: 380, cloudLayers: 4 }
}

export function hasWebGL(): boolean {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).get('webgl') === '0') return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches
