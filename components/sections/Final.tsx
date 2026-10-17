"use client";

import { frame, setUI } from "@/lib/store";
import { scrollToSection } from "@/lib/scroll";
import { Reveal, RevealText } from "@/components/ui/Reveal";

export function Final() {
  return (
    <section id="final" className="section h-[210vh]" aria-labelledby="final-title">
      <div className="sticky-stage">
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-[var(--gutter)] text-center">
          <p className="eyebrow">09 — Welcome</p>
          <RevealText as="h2" text="Move Forward." className="display legible mt-6 text-[clamp(3.4rem,12vw,12rem)]" />
          <Reveal delay={0.25}>
            <p className="gold-text mt-6 text-2xl font-extralight tracking-[0.02em] sm:text-3xl">Welcome to ASIA.</p>
          </Reveal>
          <Reveal delay={0.4} className="mt-10 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => scrollToSection("asia")}
              onPointerEnter={() => (frame.ctaHover = 1)}
              onPointerLeave={() => (frame.ctaHover = 0)}
            >
              Explore ASIA <span className="arrow" aria-hidden="true">→</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setUI({ dialog: "account" })}>
              Open an Account
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
