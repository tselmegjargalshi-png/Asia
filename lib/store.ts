"use client";

import { useSyncExternalStore } from "react";

export type Tier = "high" | "medium" | "low";
export type CardVariant = "black" | "gold" | "signature";
export type CardFinish = "polished" | "brushed" | "matte";
export type WebGLState = "pending" | "ok" | "none";
export type Dialog = null | "account" | "login";

export type UIState = {
  tier: Tier;
  webgl: WebGLState;
  reducedMotion: boolean;
  sceneReady: boolean;
  variant: CardVariant;
  finish: CardFinish;
  flipped: boolean;
  dialog: Dialog;
  phoneTab: number;
  /** intro curtain finished: hero copy may animate in */
  intro: boolean;
};

const initial: UIState = {
  tier: "medium",
  webgl: "pending",
  reducedMotion: false,
  sceneReady: false,
  variant: "black",
  finish: "polished",
  flipped: false,
  dialog: null,
  phoneTab: 0,
  intro: false,
};

let state: UIState = initial;
const listeners = new Set<() => void>();

export function getUI() {
  return state;
}

export function setUI(patch: Partial<UIState>) {
  let changed = false;
  for (const k in patch) {
    const key = k as keyof UIState;
    if (state[key] !== patch[key]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initial),
  );
}

/**
 * Per-frame, non-reactive state shared between the DOM scroll loop and the
 * WebGL scene. Mutated in place every animation frame; never triggers renders.
 */
export const frame = {
  scrollY: 0,
  vh: 1,
  vw: 1,
  /** viewport-relative position of each section: 0 when its top meets the viewport top */
  v: [] as number[],
  /** sticky progress (0..1) of each section while it is pinned */
  lp: [] as number[],
  /** presence (0..1) of each section's 3D chapter */
  pres: [] as number[],
  /** smoothed scroll velocity in px/frame */
  velocity: 0,
  pointer: { x: 0, y: 0 },
  pointerSmooth: { x: 0, y: 0 },
  ctaHover: 0,
  cardHover: 0,
  /** user rotation applied to the product card (radians) */
  cardDrag: { x: 0, y: 0, vx: 0, vy: 0 },
  globeDrag: { y: 0, vy: 0 },
  /** extra liquid disturbance, decays over time */
  ripple: 0,
  /** portrait layout (phones) */
  portrait: false,
  /** seconds of animation time (slowed when reduced motion is on) */
  time: 0,
  /** DOM elements positioned by the scene (projected hotspots / labels) */
  anchors: new Map<string, HTMLElement>(),
};

if (typeof window !== "undefined") (window as unknown as { __ASIA__: typeof frame }).__ASIA__ = frame;

export function registerAnchor(id: string, el: HTMLElement | null) {
  if (el) frame.anchors.set(id, el);
  else frame.anchors.delete(id);
}
