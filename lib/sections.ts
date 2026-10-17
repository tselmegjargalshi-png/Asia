"use client";

import { frame } from "./store";

export const SECTIONS = [
  "hero",
  "standard",
  "asia",
  "card",
  "payments",
  "global",
  "wealth",
  "security",
  "experience",
  "final",
] as const;

export type SectionId = (typeof SECTIONS)[number];
export const S = Object.fromEntries(SECTIONS.map((id, i) => [id, i])) as Record<SectionId, number>;

type Box = { top: number; height: number; el: HTMLElement };
let boxes: Box[] = [];

export function measureSections() {
  const scrollY = window.scrollY;
  boxes = SECTIONS.map((id) => {
    const el = document.getElementById(id) as HTMLElement | null;
    if (!el) return { top: 0, height: 1, el: document.body };
    const r = el.getBoundingClientRect();
    return { top: r.top + scrollY, height: Math.max(r.height, 1), el };
  });
  frame.vh = window.innerHeight;
  frame.vw = window.innerWidth;
}

const sat = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = sat((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Update the per-section scroll values. Called every frame from the scroll loop. */
export function updateSectionFrame(scrollY: number) {
  const vh = frame.vh || 1;
  const n = boxes.length;
  for (let i = 0; i < n; i++) {
    const b = boxes[i];
    const v = (scrollY - b.top) / vh;
    const span = b.height / vh - 1; // how many viewports the section stays pinned
    frame.v[i] = v;
    frame.lp[i] = span > 0.01 ? sat(v / span) : sat(v + 0.5);
    const fadeIn = i === 0 ? 1 : smooth(-0.6, -0.1, v);
    const fadeOut = i === n - 1 ? 1 : 1 - smooth(span + 0.25, span + 0.6, v);
    frame.pres[i] = fadeIn * fadeOut;
    b.el.style.setProperty("--progress", frame.lp[i].toFixed(4));
  }
}

/** Map 0..1 progress across n panels so each panel holds before gliding to the next. */
export function steppedProgress(p: number, n: number) {
  const x = p * (n - 1);
  const i = Math.min(n - 2, Math.floor(x));
  const f = x - i;
  return (i + smooth(0.45, 1, f)) / (n - 1);
}

export function sectionTop(id: SectionId) {
  const b = boxes[S[id]];
  return b ? b.top : 0;
}
