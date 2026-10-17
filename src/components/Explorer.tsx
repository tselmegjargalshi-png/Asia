import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { destinations, formatCoords } from '../data/destinations'
import { prefersReducedMotion } from '../lib/device'
import { setState, useApp } from '../lib/store'
import { useReveal } from '../hooks/useReveal'
import { ArrowLeft, ArrowRight } from './Icons'
import { Lines } from './Lines'
import { Magnetic } from './Magnetic'
import { Photo } from './Photo'

/**
 * Full frame destination viewer. Each change wipes the new place in over the old
 * one while the frame slowly settles, like a cut in a travel film.
 */
export function Explorer() {
  const root = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const active = useApp((s) => s.active)
  const index = Math.max(0, destinations.findIndex((d) => d.slug === active))
  const [layers, setLayers] = useState<{ key: number; idx: number }[]>([{ key: 0, idx: index }])
  const keyRef = useRef(0)
  const lastIdx = useRef(index)
  const dirRef = useRef(1)
  const inView = useRef(false)
  useReveal(root)

  const go = (i: number) => {
    const next = (i + destinations.length) % destinations.length
    setState({ active: destinations[next].slug })
  }

  // Stack a new layer whenever the active destination changes (from here, the atlas or a story).
  useEffect(() => {
    if (index === lastIdx.current) return
    dirRef.current = index > lastIdx.current ? 1 : -1
    lastIdx.current = index
    keyRef.current += 1
    setLayers((l) => [...l.slice(-1), { key: keyRef.current, idx: index }])
  }, [index])

  useEffect(() => {
    const el = frame.current
    if (!el || layers.length < 2) return
    const top = el.querySelector<HTMLElement>(`[data-layer="${layers[layers.length - 1].key}"]`)
    if (!top) return
    const done = () => setLayers((l) => l.slice(-1))
    if (prefersReducedMotion()) {
      done()
      return
    }
    const from = dirRef.current > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)'
    const tl = gsap.timeline({ onComplete: done })
    tl.fromTo(top, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'expo.inOut' })
    tl.fromTo(top.querySelector('.photo'), { scale: 1.25, xPercent: dirRef.current * 6 }, { scale: 1, xPercent: 0, duration: 1.9, ease: 'expo.out' }, 0)
    tl.fromTo(top.querySelectorAll('.line-mask > span'), { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.08 }, 0.55)
    return () => {
      tl.kill()
    }
  }, [layers])

  // Keyboard arrows while the explorer is on screen; swipe on touch.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { rootMargin: '-35% 0px -35% 0px' })
    io.observe(el)
    const onKey = (e: KeyboardEvent) => {
      if (!inView.current || document.querySelector('.brief')) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') go(lastIdx.current + 1)
      if (e.key === 'ArrowLeft') go(lastIdx.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      io.disconnect()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const swipe = useRef<number | null>(null)
  const d = destinations[index]

  return (
    <section ref={root} id="destinations" className="explorer" aria-labelledby="explorer-title" aria-roledescription="carousel">
      <div className="explorer__head">
        <div>
          <span className="label label--gold" data-reveal>
            Chapter 07&nbsp;&nbsp;Destinations
          </span>
          <Lines className="display" lines={['Every place,', 'one frame.']} />
          <span id="explorer-title" className="sr-only">
            Destinations
          </span>
        </div>
        <div className="explorer__controls" data-reveal>
          <button type="button" className="round-btn" onClick={() => go(index - 1)} aria-label="Previous destination">
            <ArrowLeft />
          </button>
          <span className="explorer__count" aria-live="polite">
            <b>{String(index + 1).padStart(2, '0')}</b> / {String(destinations.length).padStart(2, '0')}
          </span>
          <button type="button" className="round-btn" onClick={() => go(index + 1)} aria-label="Next destination">
            <ArrowRight />
          </button>
        </div>
      </div>

      <div className="explorer__stage" data-reveal>
        <ol className="explorer__index" aria-label="Choose a destination">
          {destinations.map((dest, i) => (
            <li key={dest.slug}>
              <button
                type="button"
                aria-current={i === index ? 'true' : undefined}
                aria-label={dest.name}
                title={dest.name}
                onClick={() => go(i)}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            </li>
          ))}
        </ol>

        <div
          ref={frame}
          className="explorer__frame"
          data-cursor="Open"
          onPointerDown={(e) => (swipe.current = e.clientX)}
          onPointerUp={(e) => {
            if (swipe.current === null) return
            const dx = e.clientX - swipe.current
            swipe.current = null
            if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
            else setState({ brief: d.slug })
          }}
          role="group"
          aria-label={`${d.name}, ${index + 1} of ${destinations.length}`}
        >
          {layers.map((layer) => {
            const dest = destinations[layer.idx]
            return (
              <div key={layer.key} data-layer={layer.key} className="explorer__slide">
                <Photo id={dest.image} alt={dest.imageAlt} sizes="(max-width: 860px) 92vw, 60vw" fallbackLabel={dest.name} />
                <div className="explorer__overlay">
                  <span className="label" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {dest.region}&nbsp;&nbsp;{dest.country}
                  </span>
                  <h3 className="display explorer__name">
                    <span className="line-mask">
                      <span>{dest.name}</span>
                    </span>
                  </h3>
                </div>
              </div>
            )
          })}
        </div>

        <div className="explorer__panel">
          <div key={d.slug}>
            <span className="label">{formatCoords(d.lat, d.lon)}</span>
            <h3>{d.headline}</h3>
            <p>{d.description}</p>
            <dl className="specs">
              <div>
                <dt>Best season</dt>
                <dd>{d.season}</dd>
              </div>
              <div>
                <dt>Climate</dt>
                <dd>{d.climate}</dd>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <dt>Did you know</dt>
                <dd>{d.fact}</dd>
              </div>
            </dl>
          </div>
          <div>
            <Magnetic>
              <button type="button" className="btn" onClick={() => setState({ brief: d.slug })}>
                Explore {d.name}
                <span className="btn__icon">
                  <ArrowRight size={10} />
                </span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}
