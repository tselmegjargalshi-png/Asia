"use client";

import { useRef } from "react";
import { frame } from "@/lib/store";
import { S } from "@/lib/sections";
import { Reveal, RevealText, SectionLabel } from "@/components/ui/Reveal";
import { useTicker } from "@/components/ui/useTicker";

const PHASES = ["Scattered savings", "Organised growth", "Expanding network"];
const METRICS = [
  { value: 8.6, suffix: "%", prefix: "+", decimals: 1, label: "Example annual return scenario" },
  { value: 6, suffix: "", prefix: "", decimals: 0, label: "Regions in a sample allocation" },
  { value: 0.25, suffix: "%", prefix: "", decimals: 2, label: "Example yearly management fee" },
];
const SPARK = "M0 80 L40 74 L80 78 L120 62 L160 66 L200 50 L240 54 L280 38 L320 42 L360 24 L400 18";

export function Wealth() {
  const phaseRefs = useRef<(HTMLLIElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const path = useRef<SVGPathElement>(null);
  const lastPhase = useRef(-1);
  useTicker(() => {
    const lp = frame.lp[S.wealth] || 0;
    const phase = lp < 0.3 ? 0 : lp < 0.66 ? 1 : 2;
    if (phase !== lastPhase.current) {
      lastPhase.current = phase;
      phaseRefs.current.forEach((el, i) => el && (el.dataset.active = String(i === phase)));
    }
    const k = Math.min(1, Math.max(0, (lp - 0.1) / 0.6));
    const eased = 1 - Math.pow(1 - k, 3);
    METRICS.forEach((m, i) => {
      const el = numRefs.current[i];
      if (el) el.textContent = m.prefix + (m.value * eased).toFixed(m.decimals) + m.suffix;
    });
    if (path.current) path.current.style.strokeDashoffset = String(520 * (1 - eased));
  });
  return (
    <section id="wealth" className="section h-[290vh]" aria-labelledby="wealth-title">
      <div className="sticky-stage">
        <div className="fallback-art absolute right-[10vw] top-1/2 -translate-y-1/2">
          <svg viewBox="0 0 300 260" className="w-[34vw] max-w-[420px]" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x={i * 24 + 6} y={240 - (i + 1) * 18} width="10" height={(i + 1) * 18} fill="none" stroke={i % 3 === 2 ? "#a8323e" : "#d2ad72"} />
            ))}
          </svg>
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end gap-6 px-[var(--gutter)] pb-[5vh] pt-24 md:justify-center md:pb-0">
          <div className="max-w-[34rem]">
            <SectionLabel index="06" label="Wealth" />
            <RevealText as="h2" text={"Make Your\nMoney Move."} className="display legible mt-5 text-[clamp(2.4rem,6vw,5.4rem)]" lineClassName={["", "gold-text"]} />
            <Reveal delay={0.2}>
              <p className="body-copy legible mt-6 hidden max-w-[28rem] sm:block [@media(max-height:860px)]:hidden">
                From scattered savings to an organised structure, then a network that keeps expanding. Wealth tools that show you the whole picture.
              </p>
            </Reveal>
            <ol className="mt-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="Phases">
              {PHASES.map((p, i) => (
                <li
                  key={p}
                  ref={(el) => { phaseRefs.current[i] = el; }}
                  data-active={i === 0}
                  className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-faint transition-colors duration-500 data-[active=true]:text-gold"
                >
                  0{i + 1} {p}
                </li>
              ))}
            </ol>
          </div>

          <Reveal delay={0.3} className="glass max-w-[34rem] rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="eyebrow !text-[0.62rem]">Illustrative portfolio</p>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ember">Example data</p>
            </div>
            <svg viewBox="0 0 400 90" className="mt-4 h-14 w-full" aria-hidden="true" preserveAspectRatio="none">
              <path d={SPARK} fill="none" stroke="rgba(239,231,218,0.1)" strokeWidth="1.5" />
              <path ref={path} d={SPARK} fill="none" stroke="#d2ad72" strokeWidth="2" strokeDasharray="520" strokeDashoffset="520" />
            </svg>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              {METRICS.map((m, i) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span ref={(el) => { numRefs.current[i] = el; }} className="block text-2xl font-extralight tracking-tight text-ivory sm:text-4xl">
                      {m.prefix}
                      {m.value.toFixed(m.decimals)}
                      {m.suffix}
                    </span>
                    <span className="mt-1 block text-[0.72rem] leading-snug text-faint" aria-hidden="true">{m.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-line pt-3 text-[0.68rem] leading-relaxed text-faint">
              Illustrative figures for a fictional concept. Not financial advice, a forecast or an offer.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
