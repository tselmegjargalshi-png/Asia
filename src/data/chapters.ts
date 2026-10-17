import type { WorldStateId } from './world'

export interface ChapterMeta {
  id: string
  label: string
  world: WorldStateId
}

/** Ordered scroll chapters; the ids match section ids in the DOM. */
export const chapterNav: ChapterMeta[] = [
  { id: 'top', label: 'Arrival', world: 'hero' },
  { id: 'discover', label: 'Discover', world: 'discover' },
  { id: 'mountains', label: 'Mountains', world: 'mountains' },
  { id: 'ocean', label: 'Ocean', world: 'ocean' },
  { id: 'hidden', label: 'Hidden', world: 'hidden' },
  { id: 'ancient', label: 'Ancient', world: 'ancient' },
  { id: 'night', label: 'Night', world: 'night' },
  { id: 'atlas', label: 'Atlas', world: 'atlas' },
  { id: 'destinations', label: 'Destinations', world: 'explore' },
  { id: 'journey', label: 'Journey', world: 'journey' },
]
