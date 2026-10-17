"use client";

import { setUI, useUI } from "@/lib/store";
import { scrollToSection } from "@/lib/scroll";
import { NAV_LINKS } from "@/components/ui/Nav";
import { Wordmark } from "@/components/ui/Emblem";

export function Footer() {
  const reduced = useUI((s) => s.reducedMotion);
  const tier = useUI((s) => s.tier);
  const webgl = useUI((s) => s.webgl);
  const toggleMotion = () => {
    const next = !reduced;
    setUI({ reducedMotion: next });
    try {
      localStorage.setItem("asia-motion", next ? "reduced" : "full");
    } catch {}
  };
  return (
    <footer className="relative z-10 border-t border-line bg-ink/80 px-[var(--gutter)] pb-10 pt-16 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-12">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <Wordmark />
            <p className="mt-5 text-sm leading-relaxed text-faint">
              ASIA is a fictional brand created for a design and development concept. It is not a bank, does not offer financial services and
              is not affiliated with any financial institution.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-14 gap-y-3 text-sm">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(l.id);
                }}
                className="text-mist transition-colors hover:text-ivory"
              >
                {l.label}
              </a>
            ))}
            <button type="button" onClick={() => setUI({ dialog: "account" })} className="text-left text-mist transition-colors hover:text-ivory">
              Open an Account
            </button>
            <button type="button" onClick={() => setUI({ dialog: "login" })} className="text-left text-mist transition-colors hover:text-ivory">
              Log in
            </button>
          </nav>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-line pt-6 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-faint sm:flex-row sm:items-center">
          <span>© 2026 ASIA concept · Design study</span>
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Render: {webgl === "none" ? "static" : `WebGL · ${tier}`}
            </span>
            <button type="button" onClick={toggleMotion} aria-pressed={reduced} className="rounded-full border border-line px-3 py-1.5 text-mist transition-colors hover:text-ivory">
              Motion: {reduced ? "Reduced" : "Full"}
            </button>
            <button type="button" onClick={() => scrollToSection("hero")} className="text-mist transition-colors hover:text-ivory">
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
