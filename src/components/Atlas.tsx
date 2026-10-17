import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { destinations, destinationBySlug, formatCoords } from '../data/destinations'
import { hasWebGL } from '../lib/device'
import { setState, useApp } from '../lib/store'
import { useReveal } from '../hooks/useReveal'
import { ArrowRight } from './Icons'
import { Lines } from './Lines'
import { Magnetic } from './Magnetic'

const GlobeCanvas = lazy(() => import('../three/globe/GlobeCanvas'))
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function Atlas() {
  const root = useRef<HTMLElement>(null)
  const globeRef = useRef<HTMLDivElement>(null)
  const active = useApp((s) => s.active)
  const [previous, setPrevious] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [webgl] = useState(hasWebGL)
  const lastActive = useRef(active)
  useReveal(root)

  useEffect(() => {
    if (lastActive.current !== active) {
      setPrevious(lastActive.current)
      lastActive.current = active
    }
  }, [active])

  // Load the globe chunk shortly before it scrolls into view, and pause it when away.
  useEffect(() => {
    const el = globeRef.current
    if (!el) return
    const near = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: '900px 0px' })
    const inView = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px 0px' })
    near.observe(el)
    inView.observe(el)
    return () => {
      near.disconnect()
      inView.disconnect()
    }
  }, [])

  const d = destinationBySlug[active]
  const thisMonth = new Date().getMonth() + 1
  const inSeason = d.months.includes(thisMonth)
  const select = (slug: string) => setState({ active: slug })

  return (
    <section ref={root} id="atlas" className="atlas" aria-labelledby="atlas-title">
      <div className="atlas__head">
        <span className="label label--gold" data-reveal>
          Chapter 06&nbsp;&nbsp;The Atlas
        </span>
        <Lines className="display" lines={['Turn the', 'planet.']} />
        <span id="atlas-title" className="sr-only">
          The Atlas
        </span>
        <p data-reveal>
          Eight coordinates, one small blue world. Drag to spin it, choose a light, and watch the route draw itself
          from your last stop.
        </p>
      </div>

      <div ref={globeRef} className="atlas__globe" data-cursor="Drag">
        {webgl && mounted ? (
          <Suspense fallback={<div className="globe-fallback" />}>
            <GlobeCanvas active={active} previous={previous} onSelect={select} visible={visible} />
          </Suspense>
        ) : (
          <div className="globe-fallback" />
        )}
        <span className="atlas__hint label">Drag to rotate&nbsp;&nbsp;Select a point</span>
      </div>

      <div className="atlas__side">
        <ul className="atlas__list" aria-label="Destinations on the atlas">
          {destinations.map((dest, i) => (
            <li key={dest.slug}>
              <button type="button" aria-pressed={dest.slug === active} onClick={() => select(dest.slug)}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="t">{dest.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="atlas__card" aria-live="polite">
          <span className="label">{formatCoords(d.lat, d.lon)}</span>
          <h3>
            {d.region}, {d.country}
          </h3>
          <p>
            {d.mood}. {inSeason ? `${MONTHS[thisMonth - 1]} is a good month to go.` : `Best from ${d.season}.`}
          </p>
          <Magnetic>
            <button type="button" className="btn btn--small" onClick={() => setState({ brief: d.slug })}>
              Open journey brief
              <span className="btn__icon">
                <ArrowRight size={10} />
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
