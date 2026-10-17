"use client";

import { useRef } from "react";
import { frame } from "@/lib/store";
import { CITIES } from "@/lib/geo";
import { Reveal, RevealText, SectionLabel } from "@/components/ui/Reveal";
import { GlobeSVG } from "@/components/fallback/GlobeSVG";

function GlobeStage() {
  const drag = useRef<{ x: number; id: number } | null>(null);
  return (
    <div
      className="webgl-only absolute inset-x-0 top-[8vh] h-[50vh] cursor-grab touch-pan-y active:cursor-grabbing md:inset-y-[10vh] md:left-auto md:right-[2vw] md:h-auto md:w-[52vw]"
      role="group"
      tabIndex={0}
      aria-label="Interactive globe. Drag or use the arrow keys to turn it."
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.x;
        d.x = e.clientX;
        frame.globeDrag.y += dx * 0.006;
        frame.globeDrag.vy = dx * 0.0015;
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") frame.globeDrag.vy -= 0.02;
        else if (e.key === "ArrowRight") frame.globeDrag.vy += 0.02;
        else return;
        e.preventDefault();
      }}
    />
  );
}

export function Global() {
  return (
    <section id="global" className="section h-[230vh]" aria-labelledby="global-title">
      <div className="sticky-stage">
        <GlobeStage />
        <div className="fallback-art absolute right-[6vw] top-1/2 h-[min(70vh,48vw)] w-[min(70vh,48vw)] -translate-y-1/2 max-md:left-1/2 max-md:top-[30vh] max-md:h-[80vw] max-md:w-[80vw] max-md:-translate-x-1/2">
          <GlobeSVG />
        </div>
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[7vh] md:justify-center md:pb-0">
          <div className="pointer-events-auto max-w-[32rem]">
            <SectionLabel index="05" label="Global" />
            <RevealText as="h2" text={"One account.\nEvery horizon."} className="display legible mt-5 text-[clamp(2.4rem,6vw,5.4rem)]" lineClassName={["", "gold-text"]} />
            <Reveal delay={0.2}>
              <p className="body-copy legible mt-6 max-w-[28rem]">
                Centred on Asia, connected to the world. Move between the cities that matter to you without changing how you bank.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <ul className="mt-8 flex max-w-[30rem] flex-wrap gap-x-5 gap-y-2" aria-label="Connected cities">
                {CITIES.map((c) => (
                  <li key={c.code} className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-mist">
                    <span className="text-gold">{c.code}</span> {c.name}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
        <p className="eyebrow webgl-only pointer-events-none absolute bottom-[5vh] right-[var(--gutter)] z-10 hidden md:block">Drag to turn the globe</p>
      </div>
    </section>
  );
}
