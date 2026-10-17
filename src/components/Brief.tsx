import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { destinationBySlug, formatCoords } from '../data/destinations'
import { prefersReducedMotion } from '../lib/device'
import { lockScroll, scrollToTarget } from '../lib/scroll'
import { setState, showToast, toggleSaved, useApp } from '../lib/store'
import { ArrowRight, Close, Pin } from './Icons'
import { Photo } from './Photo'

const LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** The journey brief: everything about one place, with save, share and locate. */
export function Brief() {
  const slug = useApp((s) => s.brief)
  const saved = useApp((s) => s.saved)
  const root = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const d = slug ? destinationBySlug[slug] : null

  const close = () => setState({ brief: null })

  useEffect(() => {
    if (!d) return
    returnFocus.current = document.activeElement as HTMLElement
    lockScroll(true)
    history.replaceState(null, '', `#journey/${d.slug}`)
    const el = root.current
    if (el && !prefersReducedMotion()) {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' })
      gsap.fromTo(el.querySelector('.brief__media .photo'), { scale: 1.2 }, { scale: 1, duration: 1.8, ease: 'expo.out' })
      gsap.from(el.querySelectorAll('[data-in]'), { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.45 })
    }
    el?.querySelector<HTMLElement>('.brief__close')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab' && el) {
        // Keep focus inside the dialog.
        const f = el.querySelectorAll<HTMLElement>('button, a[href]')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
      history.replaceState(null, '', window.location.pathname + window.location.search)
      returnFocus.current?.focus?.({ preventScroll: true })
    }
  }, [d])

  if (!d) return null
  const isSaved = saved.includes(d.slug)

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#journey/${d.slug}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${d.name} | AERORA`, text: d.headline, url })
        return
      }
      await navigator.clipboard.writeText(url)
      showToast('Link copied to your clipboard')
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') showToast('Could not share from this browser')
    }
  }

  return (
    <div ref={root} className="brief" role="dialog" aria-modal="true" aria-labelledby="brief-title">
      <div className="brief__media">
        <Photo id={d.image} alt={d.imageAlt} sizes="(max-width: 860px) 100vw, 52vw" priority fallbackLabel={d.name} />
      </div>
      <div className="brief__body">
        <button type="button" className="brief__close" onClick={close} aria-label="Close journey brief">
          CLOSE
          <span className="round-btn">
            <Close />
          </span>
        </button>
        <span className="label label--gold" data-in>
          Journey brief&nbsp;&nbsp;{d.region}, {d.country}
        </span>
        <h2 id="brief-title" className="display" data-in>
          {d.name}
        </h2>
        <p className="brief__headline" data-in>
          {d.headline}
        </p>
        <p className="brief__desc" data-in>
          {d.description}
        </p>

        <div data-in>
          <span className="label">Best months</span>
          <div className="months" aria-label={`Best months: ${d.months.map((m) => MONTHS_LONG[m - 1]).join(', ')}`}>
            {LETTERS.map((l, i) => (
              <span key={i} data-on={d.months.includes(i + 1)} aria-hidden="true">
                {l}
              </span>
            ))}
          </div>
        </div>

        <dl className="specs" data-in>
          <div>
            <dt>Best season</dt>
            <dd>{d.season}</dd>
          </div>
          <div>
            <dt>Climate</dt>
            <dd>{d.climate}</dd>
          </div>
          <div>
            <dt>Travel mood</dt>
            <dd>{d.mood}</dd>
          </div>
          <div>
            <dt>Coordinates</dt>
            <dd style={{ whiteSpace: 'pre' }}>{formatCoords(d.lat, d.lon)}</dd>
          </div>
        </dl>
        <aside className="note" data-in>
          <span className="label">Field note</span>
          <p>{d.fact}</p>
        </aside>

        <div className="brief__actions" data-in>
          <button
            type="button"
            className="btn"
            aria-pressed={isSaved}
            onClick={() => showToast(toggleSaved(d.slug) ? `${d.name} saved to your atlas` : `${d.name} removed from your atlas`)}
          >
            {isSaved ? 'Saved to your atlas' : 'Save to my atlas'}
            <span className="btn__icon">
              <ArrowRight size={10} />
            </span>
          </button>
          <button type="button" className="text-link" onClick={share}>
            Share this place
          </button>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setState({ active: d.slug, brief: null })
              requestAnimationFrame(() => scrollToTarget('#atlas'))
            }}
          >
            <Pin /> Show on the atlas
          </button>
        </div>
      </div>
    </div>
  )
}
