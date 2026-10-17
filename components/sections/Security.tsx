"use client";

import { useRef } from "react";
import { frame } from "@/lib/store";
import { S } from "@/lib/sections";
import { Reveal, RevealText, SectionLabel } from "@/components/ui/Reveal";
import { useTicker } from "@/components/ui/useTicker";

const LAYERS = [
  { k: "Layered protection", v: "Every action passes through several independent checks." },
  { k: "Biometric approval", v: "Confirm what matters with a glance or a touch." },
  { k: "Live card controls", v: "Freeze, limit or unfreeze in an instant." },
  { k: "Private by default", v: "Your data is treated as yours, not as inventory." },
];

export function Security() {
  const state = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const last = useRef("");
  useTicker(() => {
    const lp = frame.lp[S.security] || 0;
    const lock = Math.min(1, Math.max(0, (lp - 0.05) / 0.7));
    if (bar.current) bar.current.style.transform = `scaleX(${lock})`;
    const s = lock >= 0.999 ? "Sealed" : lock > 0.02 ? "Sealing" : "Open";
    if (s !== last.current && state.current) {
      last.current = s;
      state.current.textContent = s;
    }
  });
  return (
    <section id="security" className="section h-[230vh]" aria-labelledby="security-title">
      <div className="sticky-stage">
        <div className="fallback-art absolute right-[10vw] top-1/2 -translate-y-1/2">
          <svg viewBox="-100 -100 200 200" className="w-[32vw] max-w-[420px]" aria-hidden="true">
            <polygon points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45" fill="none" stroke="#d2ad72" strokeWidth="0.8" className="origin-center animate-[spin-slow_80s_linear_infinite]" />
            <polygon points="0,-62 54,-31 54,31 0,62 -54,31 -54,-31" fill="rgba(255,212,204,0.05)" stroke="rgba(255,212,204,0.4)" strokeWidth="0.8" />
            <circle r="40" fill="none" stroke="#d2ad72" strokeWidth="3" strokeDasharray="180 72" />
            <circle r="12" fill="#d8473f" />
          </svg>
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[6vh] md:justify-center md:pb-0">
          <div className="max-w-[34rem]">
            <SectionLabel index="07" label="Security" />
            <RevealText as="h2" text="Quietly Secure." className="display legible mt-5 text-[clamp(2.4rem,6vw,5.4rem)]" />
            <Reveal delay={0.15}>
              <p className="legible mt-5 text-xl font-light text-ivory/90 sm:text-2xl">Protection built into every interaction.</p>
            </Reveal>
            <Reveal delay={0.25}>
              <ul className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {LAYERS.map((l) => (
                  <li key={l.k} className="border-t border-line pt-3">
                    <p className="text-[0.95rem] text-ivory">{l.k}</p>
                    <p className="mt-1 hidden text-sm leading-relaxed text-faint sm:block">{l.v}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
            <div className="mt-8 flex items-center gap-4">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mist">
                Vault · <span ref={state} className="text-gold">Open</span>
              </span>
              <span className="relative h-px flex-1 bg-line">
                <span ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-gold" />
              </span>
            </div>
            <p className="mt-4 text-[0.68rem] text-faint">Concept features of a fictional brand, shown for design purposes only.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
