import { useRef } from 'react'
import { scrollToTarget } from '../lib/scroll'
import { useReveal } from '../hooks/useReveal'
import { Lines } from './Lines'

export function Footer() {
  const root = useRef<HTMLElement>(null)
  useReveal(root)
  const link = (href: string, label: string) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
        scrollToTarget(href)
      }}
    >
      {label}
    </a>
  )

  return (
    <footer ref={root} id="about" className="site-footer" aria-labelledby="about-title">
      <div className="footer__about">
        <div>
          <span className="label label--gold" data-reveal>
            About
          </span>
          <Lines as="h2" className="display" lines={['We collect', 'the places', 'that stay with you.']} />
          <span id="about-title" className="sr-only">
            About AERORA
          </span>
        </div>
        <div data-reveal style={{ paddingTop: 'clamp(0px, 4vw, 60px)' }}>
          <p>
            AERORA is an independent atlas of far places, made for the hours before a journey begins. We do not sell
            tickets. We gather the landscapes, seasons and small true facts that make you want one.
          </p>
          <p>
            The world you have been flying through is generated live in your browser. Every mountain, wave and star is
            drawn in real time, so no two visits look exactly alike.
          </p>
          <p style={{ color: 'var(--dim)', fontSize: 13 }}>
            Photography by contributors on Unsplash, used under the Unsplash License.
          </p>
        </div>
      </div>
      <div className="footer__wordmark" aria-hidden="true">
        AERORA
      </div>
      <div className="footer__bar">
        <span>© {new Date().getFullYear()} AERORA. An atlas of far places.</span>
        <nav aria-label="Footer">
          {link('#atlas', 'Explore')}
          {link('#destinations', 'Destinations')}
          {link('#journey', 'Journey')}
          {link('#top', 'Back to the sky')}
        </nav>
      </div>
    </footer>
  )
}
