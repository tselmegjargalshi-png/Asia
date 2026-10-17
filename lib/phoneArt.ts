import { drawEmblem, drawFront } from "./cardArt";

/** Fictional ASIA app screens, drawn to a canvas used as the 3D phone's screen texture. */

export const PHONE_TABS = ["Overview", "Cards", "Insights"] as const;
const W = 900;
const H = 1950;
const DISPLAY = '"Manrope Variable", Manrope, "Helvetica Neue", Arial, sans-serif';
const MONO = '"Space Grotesk Variable", "Space Grotesk", ui-monospace, monospace';
const IVORY = "#efe7da";
const MUTED = "rgba(239,231,218,0.55)";
const GOLD = "#d2ad72";
const CRIMSON = "#c23a45";

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function panel(ctx: Ctx, x: number, y: number, w: number, h: number, r = 36, fill = "rgba(255,255,255,0.045)") {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function text(ctx: Ctx, s: string, x: number, y: number, size: number, color = IVORY, weight = 400, font = DISPLAY, align: CanvasTextAlign = "left", spacing = 0) {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(s, x, y);
  ctx.letterSpacing = "0px";
  ctx.textAlign = "left";
}

function chrome(ctx: Ctx, tab: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#170709");
  bg.addColorStop(0.45, "#0a0607");
  bg.addColorStop(1, "#060505");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.8, 120, 0, W * 0.8, 120, 700);
  glow.addColorStop(0, "rgba(194,58,69,0.35)");
  glow.addColorStop(1, "rgba(194,58,69,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  text(ctx, "9:41", 70, 92, 38, IVORY, 600, MONO);
  ctx.fillStyle = IVORY;
  ctx.fillRect(W - 170, 70, 8, 22);
  ctx.fillRect(W - 156, 64, 8, 28);
  ctx.fillRect(W - 142, 58, 8, 34);
  ctx.beginPath();
  ctx.roundRect(W - 120, 62, 56, 30, 8);
  ctx.strokeStyle = IVORY;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillRect(W - 114, 68, 38, 18);

  drawEmblem(ctx, 92, 210, 24, GOLD);
  text(ctx, "ASIA", 136, 224, 40, IVORY, 300, DISPLAY, "left", 14);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(W - 100, 206, 40, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, "AM", W - 100, 220, 30, IVORY, 600, MONO, "center");

  // tab bar
  panel(ctx, 50, H - 210, W - 100, 140, 70, "rgba(255,255,255,0.06)");
  const labels = ["Home", "Cards", "Insights"];
  labels.forEach((l, i) => {
    const x = 50 + ((W - 100) / 3) * (i + 0.5);
    const active = i === tab;
    if (active) {
      ctx.fillStyle = "rgba(210,173,114,0.16)";
      ctx.beginPath();
      ctx.roundRect(x - 120, H - 190, 240, 100, 50);
      ctx.fill();
    }
    text(ctx, l, x, H - 127, 34, active ? GOLD : MUTED, active ? 600 : 400, DISPLAY, "center");
  });
}

function overview(ctx: Ctx) {
  text(ctx, "TOTAL BALANCE · USD", 70, 370, 28, MUTED, 500, MONO, "left", 4);
  text(ctx, "$248,192", 64, 500, 128, IVORY, 200);
  ctx.font = `200 128px ${DISPLAY}`;
  text(ctx, ".40", 64 + ctx.measureText("$248,192").width + 6, 500, 64, MUTED, 300);
  ctx.fillStyle = "rgba(210,173,114,0.15)";
  ctx.beginPath();
  ctx.roundRect(70, 540, 290, 64, 32);
  ctx.fill();
  text(ctx, "▲ 2.4%  this month", 96, 584, 28, GOLD, 600, MONO);

  // sparkline
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.beginPath();
  const pts = [0.6, 0.55, 0.62, 0.5, 0.52, 0.42, 0.46, 0.35, 0.38, 0.28, 0.3, 0.2];
  pts.forEach((p, i) => {
    const x = 70 + (i / (pts.length - 1)) * (W - 140);
    const y = 650 + p * 200;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  const fill = ctx.createLinearGradient(0, 650, 0, 860);
  fill.addColorStop(0, "rgba(210,173,114,0.25)");
  fill.addColorStop(1, "rgba(210,173,114,0)");
  ctx.lineTo(W - 70, 860);
  ctx.lineTo(70, 860);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();

  const actions = ["Send", "Receive", "Exchange", "Pay"];
  actions.forEach((a, i) => {
    const x = 70 + i * ((W - 140) / 4) + (W - 140) / 8;
    ctx.fillStyle = i === 0 ? GOLD : "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.arc(x, 960, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = i === 0 ? "#1a0f05" : IVORY;
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (i === 0) { ctx.moveTo(x - 18, 978); ctx.lineTo(x + 18, 942); ctx.moveTo(x - 4, 942); ctx.lineTo(x + 18, 942); ctx.lineTo(x + 18, 964); }
    if (i === 1) { ctx.moveTo(x + 18, 942); ctx.lineTo(x - 18, 978); ctx.moveTo(x + 4, 978); ctx.lineTo(x - 18, 978); ctx.lineTo(x - 18, 956); }
    if (i === 2) { ctx.arc(x, 960, 20, 0.3, Math.PI * 1.6); }
    if (i === 3) { ctx.roundRect(x - 22, 946, 44, 30, 6); }
    ctx.stroke();
    text(ctx, a, x, 1060, 28, MUTED, 500, DISPLAY, "center");
  });

  text(ctx, "Recent", 70, 1170, 40, IVORY, 500);
  text(ctx, "See all", W - 70, 1170, 28, GOLD, 500, DISPLAY, "right");
  const rows: [string, string, string, boolean][] = [
    ["Coffee · Seongsu, Seoul", "Today 08:12", "−₩6,500", false],
    ["Transfer from M. Arin", "Today 07:40", "+$1,200.00", true],
    ["Ride · Marina Bay", "Yesterday", "−S$14.20", false],
    ["Rail · Tokyo Station", "Yesterday", "−¥3,070", false],
  ];
  rows.forEach(([t, d, amt, pos], i) => {
    const y = 1220 + i * 120;
    panel(ctx, 50, y, W - 100, 104, 28);
    ctx.fillStyle = pos ? "rgba(210,173,114,0.2)" : "rgba(194,58,69,0.18)";
    ctx.beginPath();
    ctx.arc(110, y + 52, 30, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, t, 162, y + 46, 30, IVORY, 500);
    text(ctx, d, 162, y + 84, 24, MUTED, 400, MONO);
    text(ctx, amt, W - 80, y + 64, 32, pos ? GOLD : IVORY, 600, MONO, "right");
  });
}

function cards(ctx: Ctx) {
  text(ctx, "YOUR CARDS", 70, 370, 28, MUTED, 500, MONO, "left", 4);
  const art = drawFront("black");
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(70, 410, W - 140, ((W - 140) * art.height) / art.width, 34);
  ctx.clip();
  ctx.drawImage(art, 70, 410, W - 140, ((W - 140) * art.height) / art.width);
  ctx.restore();
  const cy = 410 + ((W - 140) * art.height) / art.width;
  [0, 1, 2].forEach((i) => {
    ctx.fillStyle = i === 0 ? GOLD : "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.roundRect(W / 2 - 60 + i * 44, cy + 40, i === 0 ? 34 : 18, 10, 5);
    ctx.fill();
  });
  text(ctx, "ASIA Black", 70, cy + 140, 48, IVORY, 400);
  text(ctx, "•• 2049 · Virtual + metal", 70, cy + 190, 28, MUTED, 400, MONO);

  const toggles: [string, string, boolean][] = [
    ["Freeze card", "Instantly pause all spending", false],
    ["Online payments", "Enabled for 3 merchants", true],
    ["Travel mode", "9 regions · auto currency", true],
  ];
  toggles.forEach(([t, d, on], i) => {
    const y = cy + 250 + i * 150;
    panel(ctx, 50, y, W - 100, 128, 30);
    text(ctx, t, 90, y + 56, 32, IVORY, 500);
    text(ctx, d, 90, y + 96, 24, MUTED, 400);
    ctx.fillStyle = on ? GOLD : "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.roundRect(W - 200, y + 40, 110, 52, 26);
    ctx.fill();
    ctx.fillStyle = on ? "#1a0f05" : IVORY;
    ctx.beginPath();
    ctx.arc(on ? W - 116 : W - 174, y + 66, 20, 0, Math.PI * 2);
    ctx.fill();
  });
  const y = cy + 720;
  text(ctx, "Monthly limit", 70, y, 30, IVORY, 500);
  text(ctx, "$6,240 / $10,000", W - 70, y, 28, MUTED, 500, MONO, "right");
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.roundRect(70, y + 30, W - 140, 16, 8);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.roundRect(70, y + 30, (W - 140) * 0.624, 16, 8);
  ctx.fill();
}

function insights(ctx: Ctx) {
  text(ctx, "OCTOBER INSIGHTS", 70, 370, 28, MUTED, 500, MONO, "left", 4);
  const cx = W / 2;
  const cy = 700;
  const parts: [string, number, string][] = [
    ["Travel", 0.34, GOLD],
    ["Living", 0.28, IVORY],
    ["Dining", 0.22, CRIMSON],
    ["Other", 0.16, "#6b4a4a"],
  ];
  let a = -Math.PI / 2;
  parts.forEach(([, p, col]) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = 46;
    ctx.beginPath();
    ctx.arc(cx, cy, 230, a + 0.03, a + p * Math.PI * 2 - 0.03);
    ctx.stroke();
    a += p * Math.PI * 2;
  });
  text(ctx, "$4,812", cx, cy + 10, 88, IVORY, 200, DISPLAY, "center");
  text(ctx, "SPENT · −8% VS SEPT", cx, cy + 66, 24, MUTED, 500, MONO, "center", 3);
  parts.forEach(([l, p, col], i) => {
    const x = 90 + (i % 2) * 380;
    const y = 1040 + Math.floor(i / 2) * 80;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y - 10, 12, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, `${l}  ${Math.round(p * 100)}%`, x + 30, y, 30, IVORY, 500);
  });

  panel(ctx, 50, 1220, W - 100, 420, 40, "rgba(210,173,114,0.08)");
  text(ctx, "QUICK TRANSFER", 90, 1290, 26, GOLD, 600, MONO, "left", 4);
  text(ctx, "To J. Park · Seoul", 90, 1360, 38, IVORY, 500);
  text(ctx, "₩1,200,000", 90, 1470, 86, IVORY, 200);
  text(ctx, "≈ $872.10 · arrives in seconds (concept)", 90, 1525, 26, MUTED, 400);
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.roundRect(90, 1560, W - 180, 56, 28);
  ctx.fill();
  text(ctx, "Slide to send", W / 2, 1598, 28, "#1a0f05", 700, DISPLAY, "center");
}

export function drawPhoneScreen(tab: number, target?: HTMLCanvasElement) {
  const c = target ?? document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d") as Ctx;
  chrome(ctx, tab);
  if (tab === 0) overview(ctx);
  else if (tab === 1) cards(ctx);
  else insights(ctx);
  return c;
}
