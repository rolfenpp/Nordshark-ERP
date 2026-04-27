import { format, formatDistanceToNow, isValid, parse, parseISO } from 'date-fns'
import { enGB } from 'date-fns/locale'

export const appDateLocale = enGB

/** If we add per-user time zones later, consider `date-fns-tz` (`toZonedTime`, `formatInTimeZone`) here. */

/** API / ISO-8601 datetime string → `Date` (invalid → `null`). Prefer over `new Date(s)` for ISO strings. */
export function parseApiDate(value: string | undefined | null): Date | null {
  if (value == null || value === '') return null
  const d = parseISO(value)
  return isValid(d) ? d : null
}

/** `yyyy-MM-dd` form value → `Date` in local calendar (invalid → `null`). */
export function parseFormYmd(ymd: string | undefined | null): Date | null {
  if (ymd == null || ymd.trim() === '') return null
  const d = parse(ymd, 'yyyy-MM-dd', new Date())
  return isValid(d) ? d : null
}

/** Picker / `Date` → `yyyy-MM-dd` for form state and text fields. */
export function toFormYmd(d: Date | null): string {
  if (d == null || !isValid(d)) return ''
  return format(d, 'yyyy-MM-dd', { locale: appDateLocale })
}

/**
 * `yyyy-MM-dd` from a form → ISO string for API bodies (noon UTC), matching previous `T12:00:00.000Z` behavior.
 */
export function formYmdToApiIso(ymd: string | undefined | null): string | undefined {
  if (ymd == null || ymd.trim() === '') return undefined
  return new Date(`${ymd}T12:00:00.000Z`).toISOString()
}

const DISPLAY = 'PP' as const

/** Format API datetime or `Date` for UI tables, detail pages, and dashboard (missing/invalid → em dash). */
export function formatDisplayDate(value: string | Date | undefined | null, pattern: string = DISPLAY): string {
  const d = typeof value === 'string' ? parseApiDate(value) : value
  if (d == null || !isValid(d)) return '—'
  return format(d, pattern, { locale: appDateLocale })
}

/** `yyyy-MM-dd` only (e.g. invoice form preview). */
export function formatFormYmdOrNotSet(ymd: string | undefined | null): string {
  const d = parseFormYmd(ymd)
  if (d == null) return 'Not set'
  return format(d, 'PP', { locale: appDateLocale })
}

export function formatRelativeTime(iso: string | undefined | null): string {
  const d = parseApiDate(iso)
  if (d == null) return '—'
  return formatDistanceToNow(d, { addSuffix: true, locale: appDateLocale })
}
