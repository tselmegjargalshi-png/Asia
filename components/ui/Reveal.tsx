"use client";

import { motion, useInView } from "framer-motion";
import { createElement, useRef } from "react";
import { useUI } from "@/lib/store";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Masked, word-by-word headline reveal. Lines can be split with "\n". */
export function RevealText({
  text,
  as = "h2",
  className = "",
  delay = 0,
  lineClassName = [] as string[],
  play,
}: {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  lineClassName?: string[];
  play?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const inView = play ?? seen;
  const reduced = useUI((s) => s.reducedMotion);
  let i = 0;
  const lines = text.split("\n");
  return createElement(
    as,
    { ref, className, "aria-label": text.replace(/\n/g, " ") },
    lines.map((line, li) => (
      <span key={li} className="block" aria-hidden="true">
        {line.split(" ").map((word, wi) => {
          const idx = i++;
          return (
            <span key={wi} className="inline-block overflow-hidden pb-[0.12em] align-top">
              <motion.span
                className={`inline-block ${lineClassName[li] ?? ""}`}
                initial={reduced ? { opacity: 0 } : { y: "110%", opacity: 0 }}
                animate={inView ? { y: "0%", opacity: 1 } : undefined}
                transition={{ duration: reduced ? 0.01 : 1.1, ease: EASE, delay: reduced ? 0 : delay + idx * 0.06 }}
              >
                {word}
                {wi < line.split(" ").length - 1 ? " " : ""}
              </motion.span>
            </span>
          );
        })}
      </span>
    )),
  );
}

/** Fade-up reveal for blocks of content. */
export function Reveal({ children, className = "", delay = 0, y = 24 }: { children: React.ReactNode; className?: string; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useUI((s) => s.reducedMotion);
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduced ? 0.01 : 1, ease: EASE, delay: reduced ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <p className="eyebrow flex items-center gap-3">
      <span className="text-gold">{index}</span>
      <span className="h-px w-8 bg-gold/50" aria-hidden="true" />
      {label}
    </p>
  );
}
