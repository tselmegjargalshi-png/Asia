import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { world } from '../lib/world'
import { scrollToTarget, lockScroll } from '../lib/scroll'
import { useApp } from '../lib/store'
import { Close } from './Icons'

const LINKS = [
  { label: 'Explore', href: '#atlas', chapters: [7] },
  { label: 'Destinations', href: '#destinations', chapters: [8] },
  { label: 'Journey', href: '#journey', chapters: [9] },
  { label: 'About', href: '#about', chapters: [] as number[] },
]

export function Nav({ activeChapter }: { activeChapter: number }) {
  const entered = useApp((s) => s.entered)
  const saved = useApp((s) => s.saved)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  // Step out of the way while travelling down, return on the way back up.
  useEffect(() => {
    let last = world.scroll
    let state = false
    const tick = () => {
      const dy = world.scroll - last
      if (Math.abs(dy) < 4) return
      last = world.scroll
      const next = dy > 0 && world.scroll > 160
      if (next !== state) {
        state = next
        setHidden(next)
      }
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    // Let the menu release the scroll lock before travelling.
    requestAnimationFrame(() => scrollToTarget(href))
  }

  return (
    <>
      <header className={`nav ${hidden && !open ? 'nav--hidden' : ''}`} style={{ opacity: entered ? 1 : 0 }}>
        <a href="#top" className="nav__brand" onClick={go('#top')} aria-label="AERORA, back to the beginning">
          AERORA
        </a>
        <nav aria-label="Primary">
          <ul className="nav__links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="nav__link"
                  onClick={go(l.href)}
                  aria-current={l.chapters.includes(activeChapter) ? 'true' : undefined}
                >
                  {l.label.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__right">
          {saved.length > 0 && (
            <a href="#journey" className="nav__saved" onClick={go('#journey')}>
              SAVED {saved.length}
            </a>
          )}
          <button
            type="button"
            className="nav__menu-btn"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="site-menu"
          >
            MENU
          </button>
        </div>
      </header>

      {open && (
        <div id="site-menu" className="menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="menu__top">
            <span className="nav__brand">AERORA</span>
            <button type="button" className="round-btn" onClick={() => setOpen(false)} aria-label="Close menu" autoFocus>
              <Close />
            </button>
          </div>
          <ul className="menu__list">
            {LINKS.map((l, i) => (
              <li key={l.href}>
                <a href={l.href} onClick={go(l.href)}>
                  <small>0{i + 1}</small>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="label">An atlas of far places</span>
        </div>
      )}
    </>
  )
}
