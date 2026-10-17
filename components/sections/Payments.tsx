"use client";

import { useRef } from "react";
import { frame } from "@/lib/store";
import { S } from "@/lib/sections";
import { Reveal, RevealText, SectionLabel } from "@/components/ui/Reveal";
import { useTicker } from "@/components/ui/useTicker";

const STAGES = [
  { k: "Person", v: "You tap or send." },
  { k: "ASIA", v: "Verified and routed." },
  { k: "World", v: "It arrives." },
];

export function Payments() {
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const status = useRef<HTMLSpanElement>(null);
  const last = useRef(-2);
  useTicker(() => {
    const lp = frame.lp[S.payments] || 0;
    const head = Math.max(0, Math.min(1, (lp - 0.08) / 0.8));
    const stage = head <= 0.02 ? -1 : head < 0.42 ? 0 : head < 0.92 ? 1 : 2;
    if (stage === last.current) return;
    last.current = stage;
    refs.current.forEach((el, i) => {
      if (el) el.dataset.state = i < stage ? "done" : i === stage ? "active" : "idle";
    });
    if (status.current)
      status.current.textContent = ["Awaiting a payment", "Payment initiated", "Routing through ASIA", "Settled"][stage + 1];
  });
  return (
    <section id="payments" className="section h-[270vh]" aria-labelledby="payments-title">
      <div className="sticky-stage">
        <div className="fallback-art absolute inset-x-[10vw] top-[44vh]">
          <svg viewBox="0 0 800 200" className="w-full" aria-hidden="true">
            <path d="M40 120 C 200 0, 300 40, 400 100 S 640 20, 760 110" fill="none" stroke="#a8323e" strokeWidth="1" />
            <path d="M40 120 C 200 0, 300 40, 400 100 S 640 20, 760 110" fill="none" stroke="#ffcf9a" strokeWidth="2" strokeDasharray="60 1400" strokeDashoffset="1460" className="animate-[dash_4s_linear_infinite]" />
            {[40, 400, 760].map((x, i) => <circle key={x} cx={x} cy={[120, 100, 110][i]} r={i === 1 ? 22 : 8} fill={i === 1 ? "#5a0f1d" : "#efe3cc"} stroke="#d2ad72" />)}
          </svg>
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between px-[var(--gutter)] pb-[6vh] pt-[14vh]">
          <div className="max-w-[34rem]">
            <SectionLabel index="04" label="Payments" />
            <RevealText as="h2" text={"Money that moves\nlike light."} className="display legible mt-5 text-[clamp(2.4rem,6vw,5.4rem)]" lineClassName={["", "gold-text"]} />
            <Reveal delay={0.2}>
              <p className="body-copy legible mt-6 max-w-[28rem]">
                Every payment takes the most direct path: from you, through ASIA, to anywhere. Scroll to follow one across the network.
              </p>
            </Reveal>
          </div>
          <div>
            <ol className="grid grid-cols-3 gap-3 sm:gap-6" aria-label="Transaction journey">
              {STAGES.map((s, i) => (
                <li
                  key={s.k}
                  ref={(el) => { refs.current[i] = el; }}
                  data-state="idle"
                  className="group border-t border-line pt-4 transition-colors duration-500 data-[state=active]:border-gold data-[state=done]:border-gold/50"
                >
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-faint transition-colors group-data-[state=active]:text-gold group-data-[state=done]:text-gold/70">
                    0{i + 1} {i < 2 && <span aria-hidden="true">→</span>}
                  </p>
                  <p className="mt-2 text-xl font-light tracking-tight text-mist transition-colors group-data-[state=active]:text-ivory sm:text-3xl">{s.k}</p>
                  <p className="mt-1 hidden text-sm text-faint sm:block">{s.v}</p>
                </li>
              ))}
            </ol>
            <p className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-faint" aria-live="polite">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-ember align-middle" aria-hidden="true" />
              <span ref={status}>Awaiting a payment</span> · illustrative visualisation
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
