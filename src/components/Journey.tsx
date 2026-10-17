import { useMemo, useRef, useState } from 'react'
import { destinationBySlug, destinations, type Destination, type MoodId } from '../data/destinations'
import { setState, useApp } from '../lib/store'
import { useReveal } from '../hooks/useReveal'
import { ArrowRight } from './Icons'
import { Lines } from './Lines'
import { Magnetic } from './Magnetic'
import { Photo } from './Photo'

const MOODS: { id: MoodId; label: string; line: string }[] = [
  { id: 'stillness', label: 'Stillness', line: 'water, light and very little else' },
  { id: 'wildness', label: 'Wildness', line: 'weather that has opinions' },
  { id: 'wonder', label: 'Wonder', line: 'something you will not quite believe' },
  { id: 'solitude', label: 'Solitude', line: 'a horizon with nobody on it' },
]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function rank(mood: MoodId, month: number): Destination[] {
  return [...destinations]
    .map((d) => ({
      d,
      score: (d.moods.includes(mood) ? 2 + (d.moods[0] === mood ? 1 : 0) : 0) + (d.months.includes(month) ? 3 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.d)
}

/** A small, honest recommender: pick a feeling and a month, get a place that fits both. */
export function Journey() {
  const root = useRef<HTMLElement>(null)
  const saved = useApp((s) => s.saved)
  const [mood, setMood] = useState<MoodId>('wonder')
  const [month, setMonth] = useState(() => new Date().getMonth() + 1)
  const [alt, setAlt] = useState(0)
  useReveal(root)

  const ranked = useMemo(() => rank(mood, month), [mood, month])
  const pick = ranked[alt % 2]
  const other = ranked[(alt + 1) % 2]
  const moodLabel = MOODS.find((m) => m.id === mood)!
  const inSeason = pick.months.includes(month)

  return (
    <section ref={root} id="journey" className="journey" aria-labelledby="journey-title">
      <span className="label label--gold" data-reveal>
        Chapter 08&nbsp;&nbsp;Your next journey
      </span>
      <Lines className="display journey__title" lines={['Choose what', 'you want', 'to feel.']} />
      <span id="journey-title" className="sr-only">
        Choose your next journey
      </span>

      <div className="journey__grid">
        <div>
          <div className="journey__step" data-reveal>
            <span className="label">01&nbsp;&nbsp;A feeling</span>
            <h3>What are you missing?</h3>
            <div className="chips" role="group" aria-label="Choose a mood">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="chip"
                  aria-pressed={mood === m.id}
                  onClick={() => {
                    setMood(m.id)
                    setAlt(0)
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="journey__step" data-reveal>
            <span className="label">02&nbsp;&nbsp;A month</span>
            <h3>When can you leave?</h3>
            <div className="chips" role="group" aria-label="Choose a month">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  className="chip chip--month"
                  aria-pressed={month === i + 1}
                  aria-label={MONTHS_LONG[i]}
                  onClick={() => {
                    setMonth(i + 1)
                    setAlt(0)
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {saved.length > 0 && (
            <div className="saved-list" data-reveal>
              <span className="label label--gold">Your saved places</span>
              <ul>
                {saved.map((slug) => (
                  <li key={slug}>
                    <button type="button" className="chip" onClick={() => setState({ brief: slug })}>
                      {destinationBySlug[slug]?.name ?? slug}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pick" aria-live="polite" data-reveal>
          <div className="pick__media">
            <Photo key={pick.slug} id={pick.image} alt={pick.imageAlt} ratio={3 / 4} sizes="(max-width: 860px) 92vw, 26vw" fallbackLabel={pick.name} />
          </div>
          <div className="pick__body">
            <span className="label label--gold">For {moodLabel.label.toLowerCase()} in {MONTHS_LONG[month - 1]}</span>
            <h3>{pick.name}</h3>
            <p className="pick__why">
              {pick.headline} If you want {moodLabel.line}, this is where to go.{' '}
              {inSeason
                ? `${MONTHS_LONG[month - 1]} sits right inside its best season.`
                : `Its best season runs ${pick.season.toLowerCase()}, so ${MONTHS_LONG[month - 1]} will feel different from the pictures.`}
            </p>
            <Magnetic>
              <button type="button" className="btn" onClick={() => setState({ brief: pick.slug })}>
                Plan {pick.name}
                <span className="btn__icon">
                  <ArrowRight size={10} />
                </span>
              </button>
            </Magnetic>
            <p className="pick__alt">
              Or consider{' '}
              <button type="button" onClick={() => setAlt((a) => a + 1)}>
                {other.name}
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
