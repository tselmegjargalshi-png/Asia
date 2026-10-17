import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { chapterNav } from '../data/chapters'
import { mixValues, presets, world } from '../lib/world'

const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * Maps scroll position to the 3D world: each chapter section owns an anchor at its
 * centre, and the world blends between the two anchors around the viewport centre.
 * Returns the index of the chapter currently in view.
 */
export function useWorldDirector(enabled: boolean) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let anchors: { center: number; top: number; bottom: number; idx: number }[] = []
    const measure = () => {
      anchors = chapterNav
        .map((c, idx) => {
          const el = document.getElementById(c.id)
          if (!el) return null
          const r = el.getBoundingClientRect()
          const top = r.top + window.scrollY
          // Weight anchors toward the top of long sections so a chapter's mood arrives with its title.
          return { center: top + Math.min(r.height * 0.5, window.innerHeight * 0.9), top, bottom: top + r.height, idx }
        })
        .filter((a): a is NonNullable<typeof a> => a !== null)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)

    let last = -1
    const tick = () => {
      if (!anchors.length) return
      const c = world.scroll + window.innerHeight * 0.5
      let i = 0
      while (i < anchors.length - 1 && anchors[i + 1].center < c) i++
      const a = anchors[i]
      const b = anchors[Math.min(i + 1, anchors.length - 1)]
      const t = a === b || c <= a.center ? 0 : smooth(Math.min(1, (c - a.center) / (b.center - a.center)))
      mixValues(world.target, presets[chapterNav[a.idx].world], presets[chapterNav[b.idx].world], t)

      let current = 0
      for (const an of anchors) if (an.top <= c) current = an.idx
      if (current !== last) {
        last = current
        setActive(current)
      }
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      ro.disconnect()
    }
  }, [enabled])

  return active
}
