const BASE = 'https://images.unsplash.com/photo-'

/** Builds an optimised Unsplash CDN URL (auto WebP / AVIF, cropped, compressed). */
export function photoUrl(id: string, width: number, height?: number, quality = 72): string {
  const h = height ? `&h=${height}` : ''
  return `${BASE}${id}?auto=format&fit=crop&w=${width}${h}&q=${quality}`
}

export function photoSrcSet(id: string, widths: number[], ratio?: number): string {
  return widths
    .map((w) => `${photoUrl(id, w, ratio ? Math.round(w / ratio) : undefined)} ${w}w`)
    .join(', ')
}

/** Resolves when the image has loaded or failed, or after `timeout` ms. */
export function preloadPhoto(id: string, width: number, timeout = 5000): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    const done = () => {
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(done, timeout)
    img.onload = done
    img.onerror = done
    img.src = photoUrl(id, width)
  })
}
