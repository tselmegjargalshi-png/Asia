"use client";

import { motion } from "framer-motion";
import { frame, setUI, useUI } from "@/lib/store";
import { scrollToSection } from "@/lib/scroll";
import { RevealText } from "@/components/ui/Reveal";
import { CardCSS } from "@/components/fallback/CardCSS";

export function Hero() {
  const intro = useUI((s) => s.intro);
  const reduced = useUI((s) => s.reducedMotion);
  const fade = (d: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 18 },
    animate: intro ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: reduced ? 0.01 : 1.2, ease: [0.16, 1, 0.3, 1] as const, delay: reduced ? 0 : d },
  });
  return (
    <section id="hero" className="section h-[175vh]" aria-labelledby="hero-title">
      <div className="sticky-stage">
        <div className="fallback-art absolute left-1/2 top-[18vh] w-[min(520px,78vw)] -translate-x-1/2 animate-[float-y_6s_ease-in-out_infinite]">
          <CardCSS />
        </div>
        <div
          className="relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[max(2.5rem,6vh)]"
          style={{ opacity: "calc(1 - var(--progress) * 1.8)", transform: "translateY(calc(var(--progress) * -80px))" }}
        >
          <motion.p {...fade(0.1)} className="eyebrow mb-6">
            Private digital banking · Est. 2026
          </motion.p>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <RevealText
              as="h1"
              text={"Money,\nReimagined."}
              play={intro}
              delay={0.15}
              className="display legible text-[clamp(3.6rem,11.5vw,11rem)]"
              lineClassName={["", "gold-text"]}
            />
            <div className="flex max-w-[26rem] flex-col gap-7 lg:pb-4">
              <motion.p {...fade(0.55)} className="body-copy legible !text-ivory/80">
                A new perspective on money, designed for the way Asia moves.
              </motion.p>
              <motion.div {...fade(0.7)} className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setUI({ dialog: "account" })}
                  onPointerEnter={() => (frame.ctaHover = 1)}
                  onPointerLeave={() => (frame.ctaHover = 0)}
                  onFocus={() => (frame.ctaHover = 1)}
                  onBlur={() => (frame.ctaHover = 0)}
                >
                  Open an Account
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => scrollToSection("standard")}
                  onPointerEnter={() => (frame.ctaHover = 0.5)}
                  onPointerLeave={() => (frame.ctaHover = 0)}
                >
                  Explore ASIA
                  <span className="arrow" aria-hidden="true">→</span>
                </button>
              </motion.div>
            </div>
          </div>
          <motion.div {...fade(1)} className="mt-10 flex items-center justify-between border-t border-line pt-5">
            <span className="eyebrow flex items-center gap-3">
              <span className="relative block h-8 w-px overflow-hidden bg-line" aria-hidden="true">
                <span className="absolute inset-0 animate-[scroll-cue_2.4s_ease-in-out_infinite] bg-gold" />
              </span>
              Scroll to enter
            </span>
            <span className="eyebrow hidden sm:block">A fictional concept bank — not a real financial institution</span>
            <span className="eyebrow">01 / 09</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
