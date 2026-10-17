import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../lib/device'
import { scrollToTarget } from '../lib/scroll'
import { useApp } from '../lib/store'
import { world } from '../lib/world'
import { ArrowDown, ArrowRight } from './Icons'
import { Magnetic } from './Magnetic'

/**
 * The arrival. Typography waits until the camera has broken through the cloud
 * deck, then rises out of the valley light.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const altRef = useRef<HTMLElement>(null)
  const entered = useApp((s) => s.entered)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const q = gsap.utils.selector(el)
    if (!entered) {
      gsap.set(q('.line-mask > span'), { yPercent: 110 })
      gsap.set(q('[data-hero-fade]'), { opacity: 0, y: 24 })
      return
    }
    const reduced = prefersReducedMotion()
    const tl = gsap.timeline({ delay: reduced ? 0 : 2.6 })
    tl.to(q('.line-mask > span'), { yPercent: 0, duration: reduced ? 0 : 1.9, ease: 'expo.out', stagger: 0.14 })
    tl.to(q('[data-hero-fade]'), { opacity: 1, y: 0, duration: reduced ? 0 : 1.4, ease: 'expo.out', stagger: 0.12 }, '-=1.3')

    // Fade the title as the visitor leaves the arrival.
    const out = gsap.to(q('.hero__inner'), {
      yPercent: -18,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
    })
    return () => {
      tl.kill()
      out.scrollTrigger?.kill()
      out.kill()
    }
  }, [entered])

  // Live altitude readout tied to the descent.
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const e = world.intro
      const eased = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2
      const alt = Math.round(8600 - eased * 7380 - Math.min(world.scroll, 2000) * 0.2)
      if (altRef.current) altRef.current.textContent = `${alt.toLocaleString('en-US')} m`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section ref={root} id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__eyebrow" data-hero-fade>
          <span className="pip" aria-hidden="true" />
          <span className="label">AERORA&nbsp;&nbsp;An atlas of far places</span>
        </div>
        <h1 id="hero-title" className="display hero__title">
          <span className="line-mask">
            <span>Where the map</span>
          </span>
          <span className="line-mask">
            <span>
              goes <em>quiet.</em>
            </span>
          </span>
        </h1>
        <div className="hero__sub">
          <p data-hero-fade>
            Eight places at the far edge of the ordinary. Glaciers, reefs, red dunes and a sky that moves. Come in
            slowly.
          </p>
          <div data-hero-fade style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
            <Magnetic>
              <a
                href="#discover"
                className="btn"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToTarget('#discover')
                }}
              >
                Begin the descent
                <span className="btn__icon">
                  <ArrowDown size={10} />
                </span>
              </a>
            </Magnetic>
            <a
              href="#atlas"
              className="text-link"
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget('#atlas')
              }}
            >
              Open the atlas <span className="arrow"><ArrowRight /></span>
            </a>
          </div>
        </div>
      </div>
      <div className="hero__foot" data-hero-fade>
        <div className="hero__readout">
          <span className="label">Altitude</span>
          <strong ref={altRef}>8,600 m</strong>
        </div>
        <div className="scroll-cue">
          <span className="label">Scroll to fly</span>
          <span className="scroll-cue__track" aria-hidden="true" />
        </div>
        <span className="label">50.94° S&nbsp;&nbsp;73.41° W</span>
      </div>
    </section>
  )
}
