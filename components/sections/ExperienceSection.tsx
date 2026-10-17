"use client";

import { useEffect } from "react";
import { setUI, useUI } from "@/lib/store";
import { scrollToSection } from "@/lib/scroll";
import { PHONE_TABS } from "@/lib/phoneArt";
import { Reveal, RevealText, SectionLabel } from "@/components/ui/Reveal";
import { PhoneCSS } from "@/components/fallback/PhoneCSS";

const FEATURES = [
  "Balance, recent activity and quick actions across every currency you hold.",
  "Freeze a card, set limits or switch on travel mode in a single tap.",
  "Spending patterns at a glance, and transfers that feel instant.",
];

export function ExperienceSection() {
  const tab = useUI((s) => s.phoneTab);
  const webgl = useUI((s) => s.webgl);
  // Without WebGL the scene loop doesn't drive the tabs, so follow scroll here.
  useEffect(() => {
    if (webgl !== "none") return;
    const el = document.getElementById("experience");
    if (!el) return;
    const onScroll = () => {
      const lp = parseFloat(getComputedStyle(el).getPropertyValue("--progress")) || 0;
      setUI({ phoneTab: lp < 0.36 ? 0 : lp < 0.7 ? 1 : 2 });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [webgl]);
  return (
    <section id="experience" className="section h-[290vh]" aria-labelledby="experience-title">
      <div className="sticky-stage">
        <div className="fallback-art absolute right-[12vw] top-1/2 w-[min(300px,24vw)] -translate-y-1/2 max-md:left-1/2 max-md:right-auto max-md:top-[30vh] max-md:w-[42vw] max-md:-translate-x-1/2">
          <PhoneCSS />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-end px-[var(--gutter)] pb-[6vh] md:justify-center md:pb-0">
          <div className="max-w-[32rem]">
            <SectionLabel index="08" label="Experience" />
            <RevealText as="h2" text={"Your money,\nin one calm place."} className="display legible mt-5 text-[clamp(2.4rem,5.6vw,5rem)]" lineClassName={["", "gold-text"]} />
            <Reveal delay={0.2}>
              <ul className="mt-8 flex flex-col" aria-label="App features">
                {PHONE_TABS.map((t, i) => (
                  <li key={t}>
                    <button
                      type="button"
                      aria-current={tab === i ? "true" : undefined}
                      onClick={() => scrollToSection("experience", i === 0 ? 0.1 : i === 1 ? 0.52 : 0.9)}
                      className="group flex w-full items-start gap-5 border-t border-line py-4 text-left transition-colors last:border-b"
                    >
                      <span className={`mt-1 font-mono text-[0.7rem] tracking-[0.2em] transition-colors ${tab === i ? "text-gold" : "text-faint"}`}>0{i + 1}</span>
                      <span className="flex-1">
                        <span className={`block text-xl font-light tracking-tight transition-colors sm:text-2xl ${tab === i ? "text-ivory" : "text-mist group-hover:text-ivory"}`}>{t}</span>
                        <span
                          className={`grid text-sm leading-relaxed text-faint transition-all duration-500 ${tab === i ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                        >
                          <span className="overflow-hidden">{FEATURES[i]}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Reveal>
            <p className="mt-5 text-[0.68rem] text-faint">Fictional interface. Names, balances and transactions are illustrative.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
