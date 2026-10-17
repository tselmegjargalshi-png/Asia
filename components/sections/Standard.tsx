"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal, RevealText, SectionLabel } from "@/components/ui/Reveal";

const WORDS = ["Mobility", "Payments", "Currencies", "Time zones", "Cities", "Seamless"];

const POINTS = [
  { k: "Multi-currency", v: "Hold and spend across Asia from one balance." },
  { k: "Borderless", v: "Transfers designed to feel instant, anywhere." },
  { k: "Mobile first", v: "Every feature shaped for life in motion." },
];

export function Standard() {
  const marquee = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!marquee.current || !section.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        marquee.current,
        { xPercent: 5 },
        {
          xPercent: -45,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
    });
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);
  return (
    <section ref={section} id="standard" className="section h-[210vh]" aria-labelledby="standard-title">
      <div className="sticky-stage">
        <div className="fallback-art absolute right-[8vw] top-1/2 -translate-y-1/2 opacity-80">
          <svg width="420" height="420" viewBox="-110 -110 220 220" className="h-[38vw] max-h-[460px] w-[38vw] max-w-[460px] animate-[spin-slow_60s_linear_infinite]" aria-hidden="true">
            {[100, 86, 72, 58, 44, 30].map((r, i) => (
              <ellipse key={r} rx={r} ry={r * (0.35 + i * 0.1)} fill="none" stroke={i % 2 ? "#5a2a2a" : "#d2ad72"} strokeWidth={i % 2 ? 2 : 0.8} transform={`rotate(${i * 30})`} />
            ))}
            <circle r="16" fill="#120708" stroke="#d8473f" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[16vh] md:justify-center md:pb-0">
          <div className="max-w-[36rem]">
            <SectionLabel index="01" label="The new standard" />
            <RevealText as="h2" text={"Built for a\nMoving World."} className="display legible mt-6 text-[clamp(2.8rem,7vw,6.5rem)]" lineClassName={["", "gold-text"]} />
            <Reveal delay={0.2}>
              <p className="body-copy legible mt-8 max-w-[30rem]">
                ASIA is designed around how life moves now: across cities, currencies and time zones. Accounts that open in minutes, payments
                that travel with you, and one calm place for everything you own.
              </p>
            </Reveal>
            <Reveal delay={0.35}>
              <dl className="mt-10 grid max-w-[34rem] grid-cols-1 gap-5 border-t border-line pt-6 sm:grid-cols-3">
                {POINTS.map((p) => (
                  <div key={p.k}>
                    <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-gold">{p.k}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-mist">{p.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[3vh] z-0 overflow-hidden md:bottom-[5vh]" aria-hidden="true">
          <div ref={marquee} className="flex w-max gap-[4vw] whitespace-nowrap will-change-transform">
            {[...WORDS, ...WORDS].map((w, i) => (
              <span
                key={i}
                className="text-[clamp(3rem,10vw,9.5rem)] font-extralight uppercase leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_rgba(239,231,218,0.16)]"
              >
                {w}
                <span className="mx-[2vw] text-gold/30 [-webkit-text-stroke:0]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
