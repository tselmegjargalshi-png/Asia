import { useState } from 'react'
import { photoSrcSet, photoUrl } from '../lib/unsplash'

interface PhotoProps {
  id: string
  alt: string
  /** Width / height. When set, crops are requested at this ratio. */
  ratio?: number
  sizes?: string
  priority?: boolean
  className?: string
  fallbackLabel?: string
}

const WIDTHS = [480, 800, 1200, 1600, 2200]

/**
 * Responsive Unsplash image that fades in once decoded and degrades to a quiet
 * typographic plate if the network fails, so a layout never shows a broken image.
 */
export function Photo({ id, alt, ratio, sizes = '100vw', priority, className, fallbackLabel }: PhotoProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div className={`photo ${className ?? ''}`} data-loaded={state === 'loaded'}>
      {state !== 'error' && (
        <img
          src={photoUrl(id, 1200, ratio ? Math.round(1200 / ratio) : undefined)}
          srcSet={photoSrcSet(id, WIDTHS, ratio)}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          draggable={false}
          ref={(img) => {
            // Cached images can complete before React attaches onLoad.
            if (img?.complete && img.naturalWidth > 0 && state === 'loading') setState('loaded')
          }}
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
        />
      )}
      {state === 'error' && (
        <div className="photo__fallback" role="img" aria-label={alt}>
          {fallbackLabel}
        </div>
      )}
    </div>
  )
}
