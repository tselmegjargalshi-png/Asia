"use client";

import { registerAnchor, useUI } from "@/lib/store";
import { CITIES } from "@/lib/geo";

const HOTSPOTS = [
  { id: "hs-chip", title: "Secure chip", text: "Gold contact plate, set flush into the surface." },
  { id: "hs-contactless", title: "Tap to pay", text: "Contactless mark, engraved rather than printed." },
  { id: "hs-mark", title: "The eclipse mark", text: "A ring and an offset disc: balance, in motion." },
  { id: "hs-edge", title: "Metal edge", text: "A solid core, finished to catch light at every angle." },
  { id: "hs-signature", title: "Signature panel", text: "Lined panel with a discreet security code area." },
  { id: "hs-holo", title: "Hologram", text: "Iridescent tile carrying the ASIA mark." },
];

/** DOM elements that the 3D scene positions over hotspots and globe cities. */
export function Anchors() {
  const webgl = useUI((s) => s.webgl);
  if (webgl !== "ok") return null;
  return (
    <>
      {HOTSPOTS.map((h) => (
        <div key={h.id} ref={(el) => registerAnchor(h.id, el)} className="anchor" data-visible="false">
          <div className="anchor-hit group relative -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              tabIndex={-1}
              aria-label={`${h.title}: ${h.text}`}
              className="relative flex h-7 w-7 items-center justify-center rounded-full border border-ivory/60 bg-ink/40 backdrop-blur-sm transition-transform duration-300 hover:scale-110 focus-visible:scale-110"
            >
              <span className="absolute inset-0 animate-ping rounded-full border border-gold/50 [animation-duration:2.4s]" aria-hidden="true" />
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            </button>
            <div className="glass pointer-events-none absolute left-9 top-1/2 w-56 -translate-y-1/2 rounded-2xl p-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-focus-within:opacity-100">
              <p className="text-sm text-ivory">{h.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-mist">{h.text}</p>
            </div>
          </div>
        </div>
      ))}
      {CITIES.map((c) => (
        <div key={c.code} ref={(el) => registerAnchor("city-" + c.code, el)} className="anchor" data-visible="false" aria-hidden="true">
          <div className="-translate-y-1/2 translate-x-3 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ivory/90 [text-shadow:0_0_12px_rgba(7,3,4,0.9)]">
            <span className="text-gold">{c.code}</span> {c.name}
          </div>
        </div>
      ))}
    </>
  );
}
