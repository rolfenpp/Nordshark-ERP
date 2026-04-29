import { CONFIG } from '@/config'

export type ApiStyleError = {
  response?: { data?: unknown }
  code?: string
  message?: string
}

export function formatLoginMutationError(
  error: unknown,
  unreachableMessage: string,
): string {
  const err = error as ApiStyleError
  if (!err?.response) {
    return [unreachableMessage, err.code ? `[${err.code}]` : '', err.message || '']
      .filter(Boolean)
      .join(' ')
  }
  const data = err.response.data
  if (typeof data === 'string') return data
  const o = (typeof data === 'object' && data ? data : {}) as {
    title?: string
    detail?: string
  }
  return o?.detail || o?.title || 'Invalid email or password.'
}

export function loginUnreachableMessage(): string {
  return [
    `Cannot reach the API at ${CONFIG.apiBaseUrl}.`,
    'Start ERP-api (e.g. dotnet run from ERP-api) or set VITE_API_BASE_URL in .env.',
  ]
    .filter(Boolean)
    .join(' ')
}

export function formatRegisterMutationError(error: unknown): string {
  const err = error as ApiStyleError
  if (!err?.response) {
    return err.message || 'Cannot reach the server. Check your connection and try again.'
  }
  const data = err.response.data
  if (typeof data === 'string') return data
  if (!data || typeof data !== 'object') {
    return 'Could not create company. Try a different name or email.'
  }
  const o = data as { title?: string; detail?: string }
  return (
    (typeof o.detail === 'string' && o.detail) ||
    (typeof o.title === 'string' && o.title) ||
    'Could not create company. Try a different name or email.'
  )
}
