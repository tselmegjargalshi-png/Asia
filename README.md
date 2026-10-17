# ASIA — Money, Reimagined

A cinematic, interactive website for **ASIA**, a *fictional* premium digital bank. This is a design and creative-technology concept: ASIA is not a real financial institution and offers no financial services.

## Experience

One persistent WebGL scene runs behind the whole page, so every chapter lives in the same universe: an eclipse-like halo, a reflective liquid horizon and drifting dust. Each section's objects rise out of the liquid and sink back as you scroll.

| # | Section | 3D chapter |
|---|---------|-----------|
| — | Hero — *Money, Reimagined.* | Metal ASIA card floating above the liquid, follows the cursor, approaches on scroll |
| 01 | Built for a Moving World | Gyroscope of precision rings that settle into one orbit |
| 02 | ASIA (six pillars) | Horizontal, pinned storytelling: emblem, glass slab, coins, card fan, tower, wire globe |
| 03 | The Card | Drag/keyboard-rotatable card, Black / Gold / Signature editions, polished / brushed / matte finish, front/back, projected hotspots |
| 04 | Payments | Living network; a transaction travels PERSON → ASIA → WORLD as you scroll |
| 05 | Global | Dotted globe centred on Asia with glowing routes between nine cities, draggable |
| 06 | Wealth | Particles morph: scattered → organised growth → expanding network (illustrative data) |
| 07 | Security | Layered vault that seals as you scroll |
| 08 | Experience | Floating phone running the fictional ASIA app (three screens) |
| 09 | Move Forward | The card recedes into darkness, the halo fades, the liquid stills |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Three.js · React Three Fiber · Drei · postprocessing · GSAP (ScrollTrigger) · Lenis · Framer Motion · Tailwind CSS 4 · custom GLSL.

## Performance & accessibility

- **Quality tiers** (HIGH / MEDIUM / LOW) chosen from GPU, cores, memory and device type; a runtime performance monitor lowers resolution and then the tier if frame rate drops. Override with `?quality=high|medium|low`.
- LOW tier swaps the real-time reflector for a shader liquid, disables post-processing and cuts particle counts.
- The 3D scene is dynamically imported only when WebGL is available. Without WebGL (or with `?webgl=0`) the site renders a static cinematic poster plus CSS/SVG versions of each chapter, including a working CSS card configurator.
- `prefers-reduced-motion` is respected (smooth scroll off, ambient motion slowed); a footer toggle lets visitors switch it manually.
- Semantic landmarks, skip link, keyboard-operable controls and dialogs, ARIA labels, visible focus.
- All textures (card art, phone UI, globe) are generated procedurally at runtime: no heavy assets to download.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build && npm start
```

Requires Node.js 20+.

## Disclaimer

ASIA, its logo, cards, figures, people and transactions are fictional. Figures in the Wealth section are illustrative only and are not financial advice, a forecast or an offer.
