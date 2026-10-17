"use client";

import { useRef } from "react";
import { frame, getUI, setUI, useUI, type CardFinish, type CardVariant } from "@/lib/store";
import { VARIANTS } from "@/lib/cardArt";
import { Reveal, RevealText, SectionLabel } from "@/components/ui/Reveal";
import { CardCSS } from "@/components/fallback/CardCSS";

const SWATCH: Record<CardVariant, string> = {
  black: "bg-[#1d1c20] ring-1 ring-white/25",
  gold: "bg-[linear-gradient(135deg,#ead2a0,#a37a43)]",
  signature: "bg-[linear-gradient(135deg,#8a1a2c,#2a050b)] ring-1 ring-gold/40",
};

export function CardStage() {
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    frame.cardDrag.y += dx * 0.009;
    frame.cardDrag.x = Math.max(-0.9, Math.min(0.9, frame.cardDrag.x + dy * 0.006));
    frame.cardDrag.vy = dx * 0.0025;
    frame.cardDrag.vx = dy * 0.0015;
  };
  const onUp = () => {
    drag.current = null;
  };
  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft") frame.cardDrag.vy -= 0.035;
    else if (k === "ArrowRight") frame.cardDrag.vy += 0.035;
    else if (k === "ArrowUp") frame.cardDrag.vx -= 0.02;
    else if (k === "ArrowDown") frame.cardDrag.vx += 0.02;
    else if (k === "Enter" || k === " ") setUI({ flipped: !getUI().flipped });
    else return;
    e.preventDefault();
  };
  return (
    <div
      className="webgl-only absolute inset-x-0 top-[8vh] h-[52vh] cursor-grab touch-pan-y select-none rounded-3xl active:cursor-grabbing md:inset-y-[12vh] md:left-auto md:right-[2vw] md:h-auto md:w-[56vw]"
      role="group"
      tabIndex={0}
      aria-label="Interactive 3D card. Drag or use the arrow keys to rotate it, press Enter to flip it."
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerEnter={() => (frame.cardHover = 1)}
      onPointerLeave={() => {
        frame.cardHover = 0;
        onUp();
      }}
      onKeyDown={onKey}
    />
  );
}

export function CardSection() {
  const variant = useUI((s) => s.variant);
  const finish = useUI((s) => s.finish);
  const flipped = useUI((s) => s.flipped);
  const v = VARIANTS[variant];
  return (
    <section id="card" className="section h-[170vh]" aria-labelledby="card-title">
      <div className="sticky-stage">
        <CardStage />
        <div className="fallback-art absolute right-[6vw] top-1/2 w-[min(560px,46vw)] -translate-y-1/2 max-md:left-1/2 max-md:right-auto max-md:top-[26vh] max-md:w-[80vw] max-md:-translate-x-1/2">
          <CardCSS interactive />
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[5vh] md:justify-center md:pb-0">
          <div className="pointer-events-auto max-w-[30rem]">
            <SectionLabel index="03" label="The card" />
            <RevealText as="h2" text="The ASIA Card." className="display legible mt-5 text-[clamp(2.4rem,6vw,5.6rem)]" />
            <Reveal delay={0.15}>
              <p className="body-copy legible mt-5 hidden sm:block">
                A physical object worth keeping. Choose a finish, turn it in your hand and explore its details.
              </p>
            </Reveal>

            <Reveal delay={0.25} className="mt-6 flex flex-col gap-5 sm:mt-8">
              <div>
                <p id="variant-label" className="eyebrow mb-3 !text-[0.65rem]">Edition</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="variant-label">
                  {(Object.keys(VARIANTS) as CardVariant[]).map((key) => (
                    <button key={key} type="button" role="radio" aria-checked={variant === key} onClick={() => setUI({ variant: key })} className="chip-toggle">
                      <span className={`h-3.5 w-3.5 rounded-full ${SWATCH[key]}`} aria-hidden="true" />
                      {VARIANTS[key].label.replace("ASIA ", "")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p id="finish-label" className="eyebrow mb-3 !text-[0.65rem]">Finish</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="finish-label">
                  {(["polished", "brushed", "matte"] as CardFinish[]).map((f) => (
                    <button key={f} type="button" role="radio" aria-checked={finish === f} onClick={() => setUI({ finish: f })} className="chip-toggle capitalize">
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="btn btn-ghost !h-11 !px-5 !text-[0.82rem]" aria-pressed={flipped} onClick={() => setUI({ flipped: !flipped })}>
                  {flipped ? "Show front" : "Show back"}
                </button>
                <button
                  type="button"
                  className="btn !h-11 !px-4 !text-[0.82rem] text-mist hover:text-ivory"
                  onClick={() => {
                    frame.cardDrag.x = frame.cardDrag.y = frame.cardDrag.vx = frame.cardDrag.vy = 0;
                    setUI({ flipped: false });
                  }}
                >
                  Reset view
                </button>
              </div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint" aria-live="polite">
                {v.label} · {v.tagline} · {finish}
              </p>
            </Reveal>
          </div>
        </div>
        <p className="eyebrow webgl-only pointer-events-none absolute bottom-[5vh] right-[var(--gutter)] z-10 hidden md:block">Drag to rotate · Hover the details</p>
      </div>
    </section>
  );
}
