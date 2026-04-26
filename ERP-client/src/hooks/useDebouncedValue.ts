import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = globalThis.setTimeout(() => setDebounced(value), delayMs)
    return () => globalThis.clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
