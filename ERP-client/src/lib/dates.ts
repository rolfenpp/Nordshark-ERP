import { format, formatDistanceToNow, isValid, parse, parseISO } from 'date-fns'
import { enGB } from 'date-fns/locale'

export const appDateLocale = enGB

export function parseApiDate(value: string | undefined | null): Date | null {
  if (value == null || value === '') return null
  const d = parseISO(value)
  return isValid(d) ? d : null
}

export function parseFormYmd(ymd: string | undefined | null): Date | null {
  if (ymd == null || ymd.trim() === '') return null
  const d = parse(ymd, 'yyyy-MM-dd', new Date())
  return isValid(d) ? d : null
}

export function toFormYmd(d: Date | null): string {
  if (d == null || !isValid(d)) return ''
  return format(d, 'yyyy-MM-dd', { locale: appDateLocale })
}

export function formYmdToApiIso(ymd: string | undefined | null): string | undefined {
  if (ymd == null || ymd.trim() === '') return undefined
  return new Date(`${ymd}T12:00:00.000Z`).toISOString()
}

const DISPLAY = 'PP' as const

export function formatDisplayDate(value: string | Date | undefined | null, pattern: string = DISPLAY): string {
  const d = typeof value === 'string' ? parseApiDate(value) : value
  if (d == null || !isValid(d)) return '—'
  return format(d, pattern, { locale: appDateLocale })
}

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
