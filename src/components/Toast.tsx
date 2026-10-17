import { useApp } from '../lib/store'

export function Toast() {
  const toast = useApp((s) => s.toast)
  return (
    <div className="toast" data-show={!!toast} role="status" aria-live="polite">
      {toast}
    </div>
  )
}
