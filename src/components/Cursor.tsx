import { useEffect, useRef, useState } from 'react'
import { isTouch, prefersReducedMotion } from '../lib/device'

/** Soft dot and ring cursor. Interactive elements can set `data-cursor="Label"`. */
export function Cursor() {
  const [enabled] = useState(() => !isTouch() && !prefersReducedMotion())
  const root = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-cursor')
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const ringPos = { ...pos }
    let raf = 0
    let visible = false

    const move = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible && root.current) {
        visible = true
        root.current.style.opacity = '1'
      }
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('a, button, [data-cursor]')
      const text = target?.dataset.cursor ?? ''
      root.current?.setAttribute('data-state', text ? 'label' : target ? 'hover' : 'idle')
      setLabel(text)
    }
    const leave = () => {
      visible = false
      if (root.current) root.current.style.opacity = '0'
    }
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div ref={root} className="cursor" data-state="idle" style={{ opacity: 0 }} aria-hidden="true">
      <div ref={ring} className="cursor__ring">
        {label}
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  )
}
