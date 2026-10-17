import { useEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../lib/device'

gsap.registerPlugin(ScrollTrigger)

/**
 * Reveals `[data-reveal]` descendants as they enter the viewport.
 * `data-reveal="lines"` slides `.line-mask > span` children up; anything else fades up.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const root = scope.current
    if (!root) return
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        const kind = el.dataset.reveal
        const delay = Number(el.dataset.delay ?? 0)
        if (kind === 'lines') {
          gsap.from(el.querySelectorAll('.line-mask > span'), {
            yPercent: 110,
            duration: 1.4,
            ease: 'expo.out',
            stagger: 0.09,
            delay,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          })
        } else if (kind === 'clip') {
          gsap.fromTo(
            el,
            { clipPath: 'inset(18% 12% 18% 12%)' },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1.8,
              ease: 'expo.out',
              delay,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          )
        } else {
          gsap.from(el, {
            y: 34,
            opacity: 0,
            duration: 1.2,
            ease: 'expo.out',
            delay,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        }
      })
      root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        const amount = Number(el.dataset.parallax || 10)
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, root)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
