import type { CardFinish, CardVariant } from "./store";

/** Card face artwork, drawn procedurally to canvas so it stays crisp and weightless. */

export const CARD_W = 3.2;
export const CARD_H = 2.018;
const TEX_W = 2048;
const TEX_H = Math.round((TEX_W * CARD_H) / CARD_W);

export const VARIANTS: Record<
  CardVariant,
  { label: string; base: [string, string]; ink: string; accent: string; edge: string; metalness: number; tagline: string }
> = {
  black: {
    label: "ASIA BLACK",
    base: ["#17161a", "#060607"],
    ink: "#e9e2d6",
    accent: "#c9a46a",
    edge: "#2a2a2e",
    metalness: 0.65,
    tagline: "Obsidian anodised core",
  },
  gold: {
    label: "ASIA GOLD",
    base: ["#d8b97f", "#94703f"],
    ink: "#2b1d0c",
    accent: "#3a2710",
    edge: "#c19a5b",
    metalness: 1,
    tagline: "Champagne gold alloy",
  },
  signature: {
    label: "ASIA SIGNATURE",
    base: ["#5a0f1d", "#1c0308"],
    ink: "#f1e3cc",
    accent: "#d9b77c",
    edge: "#8a3b3b",
    metalness: 0.8,
    tagline: "Lacquered crimson with gold leaf",
  },
};

function canvas(w = TEX_W, h = TEX_H) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

const DISPLAY = '"Manrope Variable", Manrope, "Helvetica Neue", Arial, sans-serif';
const MONO = '"Space Grotesk Variable", "Space Grotesk", ui-monospace, monospace';

/** The ASIA mark: an eclipse — a ring with an offset inner disc. */
export function drawEmblem(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + r * 0.22, y - r * 0.04, r * 0.58, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPattern(ctx: CanvasRenderingContext2D, color: string, strength: number) {
  const w = TEX_W;
  const h = TEX_H;
  ctx.save();
  // concentric "halo" arcs, centred off the right edge
  const cx = w * 0.84;
  const cy = h * 0.46;
  for (let i = 1; i < 46; i++) {
    const r = i * 34;
    const a = strength * (0.55 - i / 110);
    if (a <= 0) break;
    ctx.globalAlpha = a;
    ctx.strokeStyle = color;
    ctx.lineWidth = i % 6 === 0 ? 2.4 : 1.1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  // a precise architectural grid of dots in the lower left
  ctx.globalAlpha = strength * 0.5;
  ctx.fillStyle = color;
  for (let gx = 0; gx < 14; gx++) {
    for (let gy = 0; gy < 6; gy++) {
      const px = w * 0.06 + gx * 26;
      const py = h * 0.8 + gy * 26 - 70;
      if (px > w * 0.36) continue;
      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // fine horizon line
  ctx.globalAlpha = strength * 0.9;
  ctx.fillRect(w * 0.06, h * 0.335, w * 0.88, 1.5);
  ctx.restore();
}

function contactless(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineWidth = s * 0.09;
  for (let i = 0; i < 4; i++) {
    const r = s * (0.25 + i * 0.22);
    ctx.globalAlpha = 0.95 - i * 0.12;
    ctx.beginPath();
    ctx.arc(x - s * 0.5, y, r, -Math.PI / 4.2, Math.PI / 4.2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFront(variant: CardVariant) {
  const v = VARIANTS[variant];
  const c = canvas();
  const ctx = c.getContext("2d")!;
  const w = c.width;
  const h = c.height;

  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, v.base[0]);
  g.addColorStop(1, v.base[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // soft sheen
  const sheen = ctx.createRadialGradient(w * 0.2, h * 0.1, 0, w * 0.2, h * 0.1, w * 0.8);
  sheen.addColorStop(0, variant === "gold" ? "rgba(255,240,210,0.35)" : "rgba(255,255,255,0.06)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  drawPattern(ctx, v.accent, variant === "gold" ? 0.32 : 0.42);

  // wordmark
  ctx.fillStyle = v.ink;
  ctx.textBaseline = "alphabetic";
  ctx.font = `300 ${Math.round(h * 0.135)}px ${DISPLAY}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${Math.round(h * 0.05)}px`;
  ctx.fillText("ASIA", w * 0.06, h * 0.24);
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
  drawEmblem(ctx, w * 0.905, h * 0.165, h * 0.06, v.accent);

  contactless(ctx, w * 0.33, h * 0.5, h * 0.12, v.ink);

  // details
  ctx.font = `500 ${Math.round(h * 0.052)}px ${MONO}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${Math.round(h * 0.012)}px`;
  ctx.globalAlpha = 0.92;
  ctx.fillText("••••  ••••  ••••  2049", w * 0.06, h * 0.8);
  ctx.font = `500 ${Math.round(h * 0.034)}px ${MONO}`;
  ctx.globalAlpha = 0.65;
  ctx.fillText("MEMBER SINCE 2026", w * 0.06, h * 0.9);
  ctx.textAlign = "right";
  ctx.globalAlpha = 0.9;
  ctx.fillText(v.label.replace("ASIA ", ""), w * 0.94, h * 0.9);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
  return c;
}

export function drawBack(variant: CardVariant) {
  const v = VARIANTS[variant];
  const c = canvas();
  const ctx = c.getContext("2d")!;
  const w = c.width;
  const h = c.height;
  const g = ctx.createLinearGradient(w, 0, 0, h);
  g.addColorStop(0, v.base[0]);
  g.addColorStop(1, v.base[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  drawPattern(ctx, v.accent, 0.18);

  // magnetic band
  ctx.fillStyle = "rgba(4,4,5,0.92)";
  ctx.fillRect(0, h * 0.12, w, h * 0.17);

  // signature panel
  const px = w * 0.06;
  const py = h * 0.4;
  const pw = w * 0.56;
  const ph = h * 0.13;
  ctx.fillStyle = variant === "gold" ? "rgba(255,248,235,0.75)" : "rgba(233,226,214,0.12)";
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = variant === "gold" ? "rgba(43,29,12,0.25)" : "rgba(233,226,214,0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(px, py + (i * ph) / 12);
    ctx.lineTo(px + pw, py + (i * ph) / 12);
    ctx.stroke();
  }
  ctx.fillStyle = v.ink;
  ctx.font = `500 ${Math.round(h * 0.045)}px ${MONO}`;
  ctx.fillText("CVC  •••", px + pw + w * 0.03, py + ph * 0.66);

  // hologram tile
  const hx = w * 0.78;
  const hy = h * 0.62;
  const hs = h * 0.2;
  const holo = ctx.createLinearGradient(hx, hy, hx + hs, hy + hs);
  holo.addColorStop(0, "#c9a46a");
  holo.addColorStop(0.35, "#f3e6cf");
  holo.addColorStop(0.65, "#a8323e");
  holo.addColorStop(1, "#c9a46a");
  ctx.fillStyle = holo;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(hx, hy, hs * 1.3, hs);
  ctx.globalAlpha = 1;
  drawEmblem(ctx, hx + hs * 0.65, hy + hs * 0.5, hs * 0.28, "rgba(20,10,10,0.55)");

  ctx.fillStyle = v.ink;
  ctx.globalAlpha = 0.75;
  ctx.font = `500 ${Math.round(h * 0.03)}px ${MONO}`;
  const lines = [
    v.label + " · " + v.tagline.toUpperCase(),
    "CONCEPT ARTWORK. ASIA IS A FICTIONAL BRAND —",
    "NOT A REAL BANK OR FINANCIAL PRODUCT.",
  ];
  lines.forEach((l, i) => ctx.fillText(l, w * 0.06, h * 0.68 + i * h * 0.055));
  ctx.globalAlpha = 1;
  return c;
}

/** Roughness map: the printed pattern is glossier than the field; brushed adds streaks. */
export function drawRoughness(finish: CardFinish) {
  const c = canvas(1024, Math.round(1024 * (CARD_H / CARD_W)));
  const ctx = c.getContext("2d")!;
  const w = c.width;
  const h = c.height;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  if (finish === "brushed") {
    for (let i = 0; i < 2400; i++) {
      const y = Math.random() * h;
      const shade = 150 + Math.floor(Math.random() * 105);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(Math.random() * w * 0.4 - w * 0.2, y, w * (0.6 + Math.random()), 1);
    }
  }
  ctx.strokeStyle = "rgb(90,90,90)";
  const cx = w * 0.84;
  const cy = h * 0.46;
  for (let i = 1; i < 30; i++) {
    ctx.lineWidth = i % 6 === 0 ? 1.4 : 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy, i * 17, 0, Math.PI * 2);
    ctx.stroke();
  }
  return c;
}

export function drawChip() {
  const c = canvas(256, 192);
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 256, 192);
  g.addColorStop(0, "#f2d9a6");
  g.addColorStop(0.5, "#c59a55");
  g.addColorStop(1, "#8b6331");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 192);
  ctx.strokeStyle = "rgba(60,38,12,0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 64); ctx.lineTo(90, 64);
  ctx.moveTo(0, 128); ctx.lineTo(90, 128);
  ctx.moveTo(166, 64); ctx.lineTo(256, 64);
  ctx.moveTo(166, 128); ctx.lineTo(256, 128);
  ctx.moveTo(128, 0); ctx.lineTo(128, 50);
  ctx.moveTo(128, 142); ctx.lineTo(128, 192);
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(90, 50, 76, 92, 14);
  ctx.stroke();
  return c;
}
