"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { setUI, useUI } from "@/lib/store";
import { scrollToSection, getLenis } from "@/lib/scroll";
import { frame } from "@/lib/store";
import { Wordmark } from "./Emblem";

export const NAV_LINKS = [
  { label: "Personal", id: "standard" },
  { label: "Business", id: "payments" },
  { label: "Cards", id: "card" },
  { label: "Wealth", id: "wealth" },
  { label: "About", id: "asia" },
];

export function Nav() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useUI((s) => s.reducedMotion);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      firstLink.current?.focus();
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          menuBtn.current?.focus();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    lenis?.start();
    document.body.style.overflow = "";
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    requestAnimationFrame(() => scrollToSection(id));
  };
  const cta = (dialog: "account" | "login") => {
    setOpen(false);
    setUI({ dialog });
  };
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 220, damping: 30 };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      <motion.nav
        aria-label="Primary"
        initial={false}
        animate={{
          marginTop: compact ? 14 : 0,
          maxWidth: compact ? 1040 : 1600,
          paddingLeft: compact ? 18 : 32,
          paddingRight: compact ? 10 : 32,
          height: compact ? 60 : 88,
          borderRadius: compact ? 999 : 0,
        }}
        transition={spring}
        className={`pointer-events-auto flex w-full items-center justify-between gap-4 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          compact ? "glass mx-3 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)]" : "border border-transparent bg-transparent"
        }`}
      >
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            go("hero");
          }}
          aria-label="ASIA — back to top"
          className="shrink-0"
        >
          <Wordmark />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(l.id);
                }}
                className="rounded-full px-4 py-2 text-[0.86rem] text-mist transition-colors hover:text-ivory"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => cta("login")} className="hidden rounded-full px-4 py-2 text-[0.86rem] text-mist transition-colors hover:text-ivory sm:block">
            Log in
          </button>
          <button
            type="button"
            onClick={() => cta("account")}
            onPointerEnter={() => (frame.ctaHover = 1)}
            onPointerLeave={() => (frame.ctaHover = 0)}
            className={`btn btn-primary hidden !h-10 !px-5 !text-[0.82rem] sm:inline-flex`}
          >
            Open an Account
          </button>
          <button
            ref={menuBtn}
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`absolute h-px w-4 bg-ivory transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-[3px]"}`} />
            <span className={`absolute h-px w-4 bg-ivory transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-[3px]"}`} />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
            className="pointer-events-auto fixed inset-0 -z-10 flex flex-col justify-between bg-ink/95 px-[var(--gutter)] pb-10 pt-28 backdrop-blur-xl lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : 0.05 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    ref={i === 0 ? firstLink : undefined}
                    type="button"
                    onClick={() => go(l.id)}
                    className="flex w-full items-baseline justify-between border-b border-line py-4 text-left text-4xl font-extralight tracking-tight text-ivory"
                  >
                    {l.label}
                    <span className="font-mono text-xs text-faint">0{i + 1}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => cta("account")} className="btn btn-primary w-full">
                Open an Account
              </button>
              <button type="button" onClick={() => cta("login")} className="btn btn-ghost w-full">
                Log in
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
