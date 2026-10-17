import { useRef } from 'react'
import { formatCoords, type Destination } from '../data/destinations'
import { scrollToTarget } from '../lib/scroll'
import { setState } from '../lib/store'
import { useReveal } from '../hooks/useReveal'
import { ArrowRight, Pin } from './Icons'
import { Magnetic } from './Magnetic'
import { Photo } from './Photo'

export function DestinationStory({ d, flip, index }: { d: Destination; flip?: boolean; index: number }) {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <article ref={root} className={`story ${flip ? 'story--flip' : ''}`} aria-labelledby={`story-${d.slug}`}>
      <div className="story__media">
        <div className={`story__frame ${index % 2 ? 'story__frame--wide' : ''}`} data-reveal="clip" data-cursor="Open">
          <button
            type="button"
            onClick={() => setState({ brief: d.slug })}
            aria-label={`Open the journey brief for ${d.name}`}
            style={{ position: 'absolute', inset: 0, zIndex: 3 }}
          />
          <div className="photo-parallax" data-parallax="8" style={{ position: 'absolute', inset: 0 }}>
            <Photo id={d.image} alt={d.imageAlt} sizes="(max-width: 860px) 86vw, 56vw" fallbackLabel={d.name} />
          </div>
          <span className="story__caption">
            {d.region}, {d.country}
          </span>
        </div>
        {d.detailImage && (
          <div className="story__detail" data-reveal data-delay="0.25">
            <div data-parallax="14" style={{ position: 'absolute', inset: 0 }}>
              <Photo id={d.detailImage} alt={d.detailAlt ?? ''} ratio={3 / 4} sizes="(max-width: 860px) 40vw, 22vw" />
            </div>
          </div>
        )}
      </div>

      <div className="story__text">
        <span className="label label--gold" data-reveal>
          {d.country}
          <span className="story__coords label">{formatCoords(d.lat, d.lon)}</span>
        </span>
        <h3 id={`story-${d.slug}`} className="display story__name" data-reveal="lines">
          <span className="line-mask">
            <span>{d.name}</span>
          </span>
        </h3>
        <p className="story__headline" data-reveal>
          {d.headline}
        </p>
        <p className="story__desc" data-reveal>
          {d.description}
        </p>
        <dl className="specs" data-reveal>
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
            <dt>Region</dt>
            <dd>{d.region}</dd>
          </div>
        </dl>
        <aside className="note" data-reveal>
          <span className="label">Field note</span>
          <p>{d.fact}</p>
        </aside>
        <div className="story__actions" data-reveal>
          <Magnetic>
            <button type="button" className="btn btn--small" onClick={() => setState({ brief: d.slug })}>
              Explore {d.name}
              <span className="btn__icon">
                <ArrowRight size={10} />
              </span>
            </button>
          </Magnetic>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setState({ active: d.slug })
              scrollToTarget('#atlas')
            }}
          >
            <Pin /> Find on the atlas
          </button>
        </div>
      </div>
    </article>
  )
}
