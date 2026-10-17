import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from './device'
import { world } from './world'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function initScroll(): () => void {
  const onNativeScroll = () => {
    world.scroll = window.scrollY
  }

  if (prefersReducedMotion()) {
    window.addEventListener('scroll', onNativeScroll, { passive: true })
    return () => window.removeEventListener('scroll', onNativeScroll)
  }

  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
  lenis.on('scroll', (l: Lenis) => {
    world.scroll = l.scroll
    ScrollTrigger.update()
  })
  const tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
  }
}

export function scrollToTarget(target: string | HTMLElement, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
  if (!el) return
  if (lenis) {
    // Absolute target from the real scroll position, robust to any external scroll jumps.
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    lenis.scrollTo(top, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.classList.toggle('is-locked', locked)
}
