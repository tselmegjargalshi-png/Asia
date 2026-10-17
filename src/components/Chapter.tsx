import { useRef, type ReactNode } from 'react'
import { destinationBySlug } from '../data/destinations'
import { useReveal } from '../hooks/useReveal'
import { DestinationStory } from './DestinationStory'
import { Lines } from './Lines'

interface ChapterProps {
  id: string
  index: string
  label: string
  title: ReactNode[]
  intro: string
  slugs: string[]
  align?: 'left' | 'right'
  /** Flip the first story's layout so consecutive chapters alternate. */
  flipFirst?: boolean
}

/**
 * A chapter opens on the 3D world alone, with nothing but type, then moves
 * into its destination stories. The canvas behind it has already shifted mood.
 */
export function Chapter({ id, index, label, title, intro, slugs, align = 'left', flipFirst }: ChapterProps) {
  const root = useRef<HTMLElement>(null)
  useReveal(root)

  return (
    <section ref={root} id={id} className={`chapter ${align === 'right' ? 'chapter--right' : ''}`} aria-labelledby={`${id}-title`}>
      <div className="chapter__opening">
        <div className="chapter__index label" data-reveal>
          <b>{index}</b>
          {label}
        </div>
        <Lines className="display chapter__title" lines={title} />
        <span id={`${id}-title`} className="sr-only">
          {label}
        </span>
        <p className="chapter__intro" data-reveal data-delay="0.2">
          {intro}
        </p>
      </div>
      {slugs.map((slug, i) => (
        <DestinationStory key={slug} d={destinationBySlug[slug]} index={i} flip={flipFirst ? i % 2 === 0 : i % 2 === 1} />
      ))}
    </section>
  )
}
