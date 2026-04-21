import { useEffect, useState } from 'react'

/**
 * Debounces a value—useful for search inputs so filtering runs after typing pauses.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = globalThis.setTimeout(() => setDebounced(value), delayMs)
    return () => globalThis.clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
