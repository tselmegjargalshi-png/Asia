import { chapterNav } from '../data/chapters'
import { scrollToTarget } from '../lib/scroll'
import { useApp } from '../lib/store'

/** Quiet vertical index of chapters; the active one carries a gold point. */
export function ChapterRail({ active }: { active: number }) {
  const entered = useApp((s) => s.entered)
  return (
    <nav className="rail" aria-label="Chapters" style={{ opacity: entered ? 1 : 0 }}>
      {chapterNav.map((c, i) => (
        <button
          key={c.id}
          type="button"
          className="rail__item"
          aria-current={i === active ? 'true' : undefined}
          aria-label={`Go to ${c.label}`}
          onClick={() => scrollToTarget(`#${c.id}`)}
        >
          {c.label}
          <span className="rail__dot" />
        </button>
      ))}
    </nav>
  )
}
