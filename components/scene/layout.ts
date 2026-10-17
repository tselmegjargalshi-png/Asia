import { frame } from "@/lib/store";

/** Responsive placement: desktop puts objects beside the copy, portrait stacks them above it. */
export function place(desktop: [number, number, number], portrait: [number, number, number]) {
  return frame.portrait ? portrait : desktop;
}

/** Camera distance multiplier so content fits narrow viewports. */
export function distanceFactor() {
  const aspect = frame.vw / Math.max(frame.vh, 1);
  return Math.min(2.3, Math.max(1, 1.05 / aspect));
}

/** Rise-from-the-liquid transition used by every chapter object. */
export function emerge(pres: number, v: number) {
  const hidden = 1 - pres;
  // entering from below, leaving by sinking back
  return { dy: -hidden * (v < 0 ? 3.2 : 2.6), scale: 0.6 + 0.4 * pres, hidden };
}

/**
 * Shared chapter transition: hides the group when its section is far away,
 * otherwise positions it (desktop / portrait) and lets it rise from the liquid.
 * Returns the section presence so callers can skip work when hidden.
 */
export function applyChapter(
  g: { visible: boolean; position: { set: (x: number, y: number, z: number) => void }; scale: { setScalar: (s: number) => void } },
  k: number,
  desktop: [number, number, number],
  portrait: [number, number, number],
  scale = 1,
  portraitScale = 0.85,
) {
  const pres = frame.pres[k] || 0;
  g.visible = pres > 0.002;
  if (!g.visible) return 0;
  const v = frame.v[k] || 0;
  const e = emerge(pres, v);
  const p = place(desktop, portrait);
  g.position.set(p[0], p[1] + e.dy, p[2]);
  g.scale.setScalar((frame.portrait ? portraitScale : scale) * e.scale);
  return pres;
}
