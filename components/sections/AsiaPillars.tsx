"use client";

import { useRef } from "react";
import { frame } from "@/lib/store";
import { S, steppedProgress } from "@/lib/sections";
import { SectionLabel } from "@/components/ui/Reveal";
import { useTicker } from "@/components/ui/useTicker";

const PANELS = [
  { title: "ASIA", kicker: "The identity", text: "A bank shaped like a circle: balanced, continuous and complete. Calm by design, precise in every detail." },
  { title: "Digital Banking", kicker: "Everyday", text: "Open, manage and move money from one quiet interface. No branches, no queues, no noise." },
  { title: "Payments", kicker: "In motion", text: "Tap, send or settle in any city as easily as at home, in the currency of wherever you are." },
  { title: "Cards", kicker: "Objects", text: "Metal cards with real-time controls, issued virtually in seconds and crafted to be kept." },
  { title: "Wealth", kicker: "Long term", text: "Long-term thinking made simple and transparent, with your whole picture in one view." },
  { title: "Global Access", kicker: "Everywhere", text: "From Ulaanbaatar to London, one account that travels with you across borders." },
];

function Glyph({ i }: { i: number }) {
  const common = { fill: "none", stroke: "#d2ad72", strokeWidth: 1.2 };
  return (
    <svg viewBox="-60 -60 120 120" className="h-40 w-40" aria-hidden="true">
      {i === 0 && (<><circle r="44" {...common} /><circle cx="9" cy="-2" r="26" fill="#5a0f1d" /></>)}
      {i === 1 && (<><rect x="-30" y="-44" width="60" height="88" rx="6" {...common} />{[-30, -15, 0, 15, 30].map((y) => <line key={y} x1="-22" x2="22" y1={y} y2={y} stroke="#a8323e" strokeWidth="0.6" />)}</>)}
      {i === 2 && [0, 1, 2].map((k) => <ellipse key={k} cx={k * 8 - 8} cy={k * 8 - 8} rx="36" ry="12" {...common} />)}
      {i === 3 && [-1, 0, 1].map((k) => <rect key={k} x="-34" y="-21" width="68" height="42" rx="5" {...common} transform={`rotate(${k * 16}) translate(${k * 10} 0)`} />)}
      {i === 4 && Array.from({ length: 8 }, (_, k) => <rect key={k} x={-40 + k * 10} y={30 - k * 9} width="7" height={k * 9 + 10} {...common} />)}
      {i === 5 && (<><circle r="40" {...common} /><ellipse rx="40" ry="14" {...common} /><ellipse rx="14" ry="40" {...common} /></>)}
    </svg>
  );
}

export function AsiaPillars() {
  const counter = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const last = useRef(-1);
  useTicker(() => {
    const p = steppedProgress(frame.lp[S.asia] || 0, PANELS.length);
    if (track.current) track.current.style.transform = `translate3d(${(-p * (PANELS.length - 1) * 100).toFixed(3)}vw, 0, 0)`;
    const i = Math.min(PANELS.length - 1, Math.round(p * (PANELS.length - 1)));
    if (i !== last.current && counter.current) {
      last.current = i;
      counter.current.textContent = String(i + 1).padStart(2, "0");
    }
  });
  return (
    <section id="asia" className="section h-[620vh]" aria-labelledby="asia-title">
      <div className="sticky-stage">
        <div className="absolute left-[var(--gutter)] top-[13vh] z-10">
          <SectionLabel index="02" label="ASIA" />
          <h2 id="asia-title" className="sr-only">ASIA: the six pillars of the bank</h2>
        </div>
        <div ref={track} className="flex h-full w-max will-change-transform">
          {PANELS.map((p, i) => (
            <article key={p.title} className="relative flex h-full w-screen flex-col justify-end px-[var(--gutter)] pb-[16vh] md:justify-center md:pb-0" aria-label={p.title}>
              <div className="relative z-10 max-w-[34rem]">
                <p className="font-mono text-[clamp(4rem,9vw,8rem)] font-light leading-none text-transparent [-webkit-text-stroke:1px_rgba(210,173,114,0.45)]">
                  0{i + 1}
                </p>
                <p className="eyebrow mt-6">{p.kicker}</p>
                <h3 className={`display legible mt-3 text-[clamp(2.6rem,6.4vw,6rem)] ${i === 0 ? "gold-text tracking-[0.12em]" : ""}`}>{p.title}</h3>
                <p className="body-copy legible mt-6 max-w-[28rem]">{p.text}</p>
              </div>
              <div className="fallback-art absolute right-[10vw] top-1/2 -translate-y-1/2">
                <Glyph i={i} />
              </div>
            </article>
          ))}
        </div>
        <div className="absolute inset-x-[var(--gutter)] bottom-[6vh] z-10 flex items-center gap-6">
          <span className="font-mono text-xs tracking-[0.2em] text-mist">
            <span ref={counter} className="text-ivory">01</span> / 06
          </span>
          <div className="h-px flex-1 bg-line">
            <div className="progress-bar h-px bg-gold" />
          </div>
          <span className="eyebrow hidden sm:block">Keep scrolling</span>
        </div>
      </div>
    </section>
  );
}
