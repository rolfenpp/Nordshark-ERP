export const DEFAULT_AFTER_AUTH = '/dashboard' as const

export function getSafeRedirectPath(
  raw: string | undefined | null,
  fallback: string = DEFAULT_AFTER_AUTH,
): string {
  if (raw == null || typeof raw !== 'string') return fallback
  let s = raw.trim()
  try {
    s = decodeURIComponent(s)
  } catch {
    return fallback
  }
  if (!s.startsWith('/') || s.startsWith('//')) return fallback
  try {
    const u = new URL(s, 'https://_._')
    if (u.host !== '_._') return fallback
    const out = `${u.pathname}${u.search}${u.hash}`
    const lowerProto = `${u.pathname}${u.search}`.toLowerCase()
    if (/(?:^|\/|\\)(javascript|data):/i.test(lowerProto)) return fallback
    if (out.length > 4096) return fallback
    return out.length > 0 ? out : fallback
  } catch {
    return fallback
  }
}

export function attemptedPathForRedirect(
  pathname: string,
  search: string,
): string {
  const full = pathname + (search ?? '')
  if (pathname === '/login' || pathname === '/register') return ''
  const safe = getSafeRedirectPath(full, full.startsWith('/') ? full : '')
  return safe.startsWith('/') && safe !== '/login' && safe !== '/register'
    ? safe
    : ''
}
