import { isAxiosError } from 'axios'

/** User-facing API errors: prefer `apiRequest` / `parseApiError` in queryFn and mutations so message text stays DRY. */
function extractBodyMessage(data: unknown): string | null {
  if (data == null) return null
  if (typeof data === 'string' && data.trim()) return data.trim()
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>
    const m = o.message
    if (typeof m === 'string' && m.trim()) return m.trim()
    const t = o.title
    if (typeof t === 'string' && t.trim()) return t.trim()
    const detail = o.detail
    if (typeof detail === 'string' && detail.trim()) return detail.trim()
    const err = o.errors
    if (err && typeof err === 'object') {
      const parts = Object.entries(err as Record<string, string[]>)
        .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(', ')}` : `${k}`))
        .filter(Boolean)
      if (parts.length) return parts.join('; ')
    }
  }
  return null
}

export function toUserMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (typeof error === 'string' && error.trim()) return error.trim()
  if (error instanceof Error && error.message && !isAxiosError(error)) {
    return error.message
  }
  if (!isAxiosError(error)) {
    if (error && typeof error === 'object' && 'message' in (error as object)) {
      const m = (error as { message?: unknown }).message
      if (typeof m === 'string' && m.trim()) return m.trim()
    }
    return fallback
  }

  const status = error.response?.status
  const fromBody = extractBodyMessage(error.response?.data)
  if (fromBody) return fromBody

  if (status === 401) return 'Session expired or not signed in. Please log in again.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 404) return 'The requested item was not found.'
  if (status === 409) return 'This action could not be completed because of a conflict (e.g. duplicate data).'
  if (status === 400) return 'The request was invalid. Check your input and try again.'

  if (error.message === 'Network Error' || !error.response) {
    return 'Network error. Check your connection and try again.'
  }

  return fallback
}

export function parseApiError(error: unknown, fallback: string): Error {
  return new Error(toUserMessage(error, fallback))
}

export async function apiRequest<T>(fn: () => Promise<T>, fallback: string): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    throw parseApiError(e, fallback)
  }
}
