type InvalidateFn = () => void

const listeners = new Set<InvalidateFn>()

export function subscribeSessionInvalidate(fn: InvalidateFn): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function notifySessionInvalidate(): void {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch {}
  })
}
