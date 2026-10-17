import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { categories } from '../data/categories'
import { isTouch, prefersReducedMotion } from '../lib/device'
import { photoUrl } from '../lib/unsplash'
import { scrollToTarget } from '../lib/scroll'
import { world } from '../lib/world'
import { useReveal } from '../hooks/useReveal'
import { Lines } from './Lines'

const MANIFESTO =
  'Somewhere right now, light is falling across a glacier nobody is watching. Wind is reshaping a dune that will never look this way again. AERORA is an atlas of those moments, and a quiet invitation to be standing there for the next one.'
const HIGHLIGHT = new Set(['glacier', 'dune', 'moments,'])

const CHAPTER_FOR: Record<string, string> = {
  mountains: '#mountains',
  oceans: '#ocean',
  deserts: '#ancient',
  forests: '#hidden',
  islands: '#ocean',
  ancient: '#ancient',
  hidden: '#hidden',
  aurora: '#night',
}

export function Discover() {
  const root = useRef<HTMLElement>(null)
  const floatRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  useReveal(root)

  // Words brighten one by one as the paragraph scrolls through the viewport.
  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const words = el.querySelectorAll<HTMLElement>('.manifesto .w')
    const st = gsap.to(words, {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: el.querySelector('.manifesto'), start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
    })
    return () => {
      st.scrollTrigger?.kill()
      st.kill()
    }
  }, [])

  // Floating preview follows the pointer over the atmosphere list.
  useEffect(() => {
    const float = floatRef.current
    if (!float || isTouch()) return
    const xTo = gsap.quickTo(float, 'x', { duration: 0.7, ease: 'power3.out' })
    const yTo = gsap.quickTo(float, 'y', { duration: 0.7, ease: 'power3.out' })
    const rTo = gsap.quickTo(float, 'rotation', { duration: 0.9, ease: 'power3.out' })
    let lastX = 0
    const move = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      rTo(Math.max(-8, Math.min(8, (e.clientX - lastX) * 0.4)))
      lastX = e.clientX
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useEffect(() => {
    const float = floatRef.current
    if (!float) return
    gsap.to(float, { opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85, duration: 0.5, ease: 'power3.out' })
  }, [hovered])

  const focus = (id: string | null) => {
    setHovered(id)
    world.override = id ? categories.find((c) => c.id === id)!.world : null
  }

  return (
    <section ref={root} id="discover" className="discover" aria-labelledby="discover-title">
      <span className="label label--gold" data-reveal>
        Chapter 00&nbsp;&nbsp;Discover
      </span>
      <h2 id="discover-title" className="sr-only">
        Discover
      </h2>
      <p className="manifesto">
        {MANIFESTO.split(' ').map((w, i) => (
          <span key={i}>
            <span className="w">{HIGHLIGHT.has(w) ? <em>{w}</em> : w}</span>{' '}
          </span>
        ))}
      </p>

      <div className="atmos">
        <div className="atmos__intro">
          <span className="label" data-reveal>
            Eight atmospheres
          </span>
          <Lines as="h3" className="display" lines={['Choose a', 'kind of light.']} />
          <p data-reveal style={{ marginTop: 24, fontSize: 15 }}>
            Hover to change the weather of this world. Select one to travel straight to it.
          </p>
        </div>
        <ul className="atmos__list" onPointerLeave={() => focus(null)}>
          {categories.map((c, i) => (
            <li key={c.id} className="atmos__item" data-reveal data-delay={i * 0.04}>
              <button
                type="button"
                onPointerEnter={() => focus(c.id)}
                onFocus={() => focus(c.id)}
                onBlur={() => focus(null)}
                onClick={() => {
                  focus(null)
                  scrollToTarget(CHAPTER_FOR[c.id])
                }}
                data-cursor="Travel"
              >
                <span className="atmos__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="atmos__name">{c.label}</span>
                <span className="atmos__line">{c.line}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div ref={floatRef} className="atmos__float" aria-hidden="true">
        {categories.map((c) => (
          <img
            key={c.id}
            src={photoUrl(c.image, 600, 750)}
            alt=""
            loading="lazy"
            style={{ opacity: hovered === c.id ? 1 : 0 }}
          />
        ))}
      </div>
    </section>
  )
}
