"use client";

import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  lenis = l;
}

export function getLenis() {
  return lenis;
}

/** Smoothly scroll to a section (or a fraction through a pinned section). */
export function scrollToSection(id: string, fraction = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  const pinned = Math.max(0, el.offsetHeight - window.innerHeight);
  const y = top + pinned * fraction;
  const reduce = document.documentElement.dataset.motion === "reduced";
  if (lenis && !reduce) lenis.scrollTo(y, { duration: 1.8, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  // move keyboard focus to the section for screen reader / keyboard users
  const heading = el.querySelector<HTMLElement>("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
}
