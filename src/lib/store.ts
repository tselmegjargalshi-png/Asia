import { useSyncExternalStore } from 'react'

export interface AppState {
  /** Loader has finished and the opening descent has started. */
  entered: boolean
  /** Destination focused in the atlas and explorer. */
  active: string
  /** Destination whose journey brief is open, if any. */
  brief: string | null
  saved: string[]
  toast: string | null
}

const SAVED_KEY = 'aerora:saved'

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : []
  } catch {
    return []
  }
}

let state: AppState = {
  entered: false,
  active: 'patagonia',
  brief: null,
  saved: typeof window === 'undefined' ? [] : readSaved(),
  toast: null,
}

const listeners = new Set<() => void>()

export function getState() {
  return state
}

export function setState(patch: Partial<AppState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useApp<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
export function showToast(message: string) {
  setState({ toast: message })
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => setState({ toast: null }), 2600)
}

export function toggleSaved(slug: string) {
  const has = state.saved.includes(slug)
  const saved = has ? state.saved.filter((s) => s !== slug) : [...state.saved, slug]
  setState({ saved })
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
  } catch {
    /* storage unavailable (private mode); keep in memory only */
  }
  return !has
}
