import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../lib/device'

const STATUS = ['Calibrating light', 'Raising the mountains', 'Filling the oceans', 'Scattering the stars', 'Ready']

interface LoaderProps {
  /** 0..1, real progress of critical assets. */
  progress: number
  ready: boolean
  onDone: () => void
}

/**
 * Minimal opening: a breathing point of light, a ring that fills with real
 * progress, and a counter that eases toward it so it never jumps or stalls.
 */
export function Loader({ progress, ready, onDone }: LoaderProps) {
  const root = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const shown = useRef(0)
  const target = useRef(0)
  const start = useRef(0)
  const finished = useRef(false)
  const [status, setStatus] = useState(STATUS[0])

  useEffect(() => {
    target.current = ready ? 1 : Math.min(progress, 0.96)
  }, [progress, ready])

  useEffect(() => {
    if (!start.current) start.current = performance.now()
    const circumference = 2 * Math.PI * 49
    let raf = 0
    let last = performance.now()
    const loop = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const elapsed = now - start.current
      // Never let the counter outrun a minimum cinematic pace.
      const paced = Math.min(target.current, elapsed / 1500)
      shown.current += (paced - shown.current) * (1 - Math.exp(-dt * 4.5))
      if (ready && paced >= 1 && shown.current > 0.985) shown.current = 1
      const pct = Math.round(shown.current * 100)
      if (countRef.current) countRef.current.textContent = String(pct).padStart(2, '0')
      if (ringRef.current) ringRef.current.style.strokeDashoffset = String(circumference * (1 - shown.current))
      setStatus(STATUS[Math.min(STATUS.length - 1, Math.floor(shown.current * (STATUS.length - 1) + 0.0001))])

      if (shown.current >= 1 && !finished.current) {
        finished.current = true
        const el = root.current
        if (!el || prefersReducedMotion()) {
          onDone()
          return
        }
        gsap
          .timeline({ onComplete: onDone })
          .to(el.querySelector('.loader__core'), { scale: 1.6, opacity: 0, duration: 1.1, ease: 'expo.in' }, 0.15)
          .to(el.querySelectorAll('.loader__meta, .loader__brand'), { opacity: 0, duration: 0.6 }, 0.15)
          .to(el, { opacity: 0, duration: 1, ease: 'power2.inOut' }, 0.9)
        return
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [ready, onDone])

  return (
    <div ref={root} className="loader" role="status" aria-live="polite" aria-label="Loading AERORA">
      <span className="loader__brand label">AERORA</span>
      <div className="loader__core">
        <svg className="loader__ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="49" stroke="rgba(236,241,236,0.08)" />
          <circle
            ref={ringRef}
            cx="50"
            cy="50"
            r="49"
            stroke="#e6c48f"
            strokeDasharray={2 * Math.PI * 49}
            strokeDashoffset={2 * Math.PI * 49}
            strokeLinecap="round"
          />
        </svg>
        <div className="loader__glow" />
        <span className="loader__count">
          <span ref={countRef}>00</span>
          <sup>%</sup>
        </span>
      </div>
      <div className="loader__meta">
        <span className="label">An atlas of far places</span>
        <span className="label loader__status">{status}</span>
      </div>
    </div>
  )
}
