# AERORA

An atlas of far places. A cinematic, scroll driven travel experience built around one persistent, procedurally generated 3D world.

The visitor descends through a cloud deck into a glacial valley, then keeps flying while the world transforms around them: ridged mountains, a turquoise reef sea, misted fiords, wind shaped dunes, and finally an aurora night. Every chapter introduces real destinations with photography, field notes, best seasons and climate.

## Experience

| Chapter | World | Destinations |
| --- | --- | --- |
| Arrival | Descent through clouds into a dusk valley, live altitude readout | |
| Discover | Manifesto, eight atmospheres; hovering one re-lights the 3D world | |
| 01 Mountains | Snow on ridged peaks, low sun | Patagonia, Dolomites |
| 02 Ocean | Terrain sinks, reefs and foam appear | Maldives |
| 03 Hidden places | Dense emerald fog | Fiordland, Altai |
| 04 Ancient worlds | Ridges morph into desert dunes | Petra, Namib |
| 05 Night | Stars and aurora | Iceland |
| 06 Atlas | Interactive dotted globe: drag, select, routes draw between choices | all |
| 07 Destinations | Full frame viewer with wipe transitions, keyboard and swipe | all |
| 08 Journey | Mood + month recommender, saved places | all |

Every destination opens a **journey brief** (best months, climate, mood, field note) with save to "my atlas" (localStorage), share (Web Share API or copy link) and "show on the atlas". Briefs are deep linkable: `/#journey/petra`.

## Stack

Vite, React 19, TypeScript, Three.js, React Three Fiber, GSAP (ScrollTrigger), Lenis. Fonts are self hosted through Fontsource (Instrument Serif, Manrope).

## Architecture

```
src/
  data/        destinations, categories, chapters and world art direction (typed objects)
  lib/         world state singleton, scroll (Lenis + GSAP), device quality, store, Unsplash helpers
  three/       WorldCanvas (sky, terrain, water, clouds, dust, Director) and globe/GlobeCanvas
  components/  UI: Loader, Nav, Hero, Discover, Chapter, DestinationStory, Atlas, Explorer, Journey, Brief
  hooks/       useWorldDirector (scroll to world blending), useReveal (GSAP reveals and parallax)
```

* The DOM never re-renders on scroll. `useWorldDirector` blends between per chapter world presets and writes into a mutable singleton; the R3F `Director` damps toward it each frame and updates one shared uniform bag used by every shader.
* All terrain, water, sky, aurora and clouds are procedural GLSL. No 3D models or textures are downloaded.
* The globe chunk (and its land dot data) is code split and only mounts near the viewport; it stops rendering when off screen.

## Performance and accessibility

* Quality tier from pointer type, screen size, CPU cores and memory: lower terrain resolution, fewer particles and cloud layers, capped pixel ratio on mobile. Force with `?quality=high` or `?quality=low`.
* Without WebGL (or `?webgl=0`) the site renders with a still photograph behind the same content.
* `prefers-reduced-motion`: native scrolling, no descent, no reveals.
* Semantic sections, labelled landmarks, focus trapped dialogs, keyboard navigation for explorer (arrow keys), visible focus states.

## Development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type checks, then builds to dist/
npm run preview
```

No environment variables are required.

## Credits

Photography by contributors on [Unsplash](https://unsplash.com), served from the Unsplash CDN under the Unsplash License.
