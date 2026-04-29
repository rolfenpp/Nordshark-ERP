import type { InvoiceListDto } from '@/api/invoices'
import { normalizeInvoiceStatus } from '@/lib/statusNormalize'
import { format, isSameYear, parseISO } from 'date-fns'
import { appDateLocale } from '@/lib/dates'

export const REVENUE_PERIODS = ['day', 'week', 'month', 'year', '3y'] as const
export type RevenuePeriod = (typeof REVENUE_PERIODS)[number]

export const REVENUE_PERIOD_LABELS: Record<RevenuePeriod, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year',
  '3y': '3Y',
}

export type RevenuePoint = { label: string; revenue: number }

export function effectivePaidDate(inv: InvoiceListDto): string {
  return inv.paidDate ?? inv.issueDate
}

function addToRangeFirstLast(
  bucketStarts: { label: string; startMs: number; endMs: number; revenue: number }[],
  t: number,
  amount: number
) {
  const first = bucketStarts[0]!
  const last = bucketStarts[bucketStarts.length - 1]!
  for (const b of bucketStarts) {
    if (t >= b.startMs && t <= b.endMs) {
      b.revenue += amount
      return
    }
  }
  if (t < first.startMs) first.revenue += amount
  else if (t > last.endMs) last.revenue += amount
}

function startOfLocalDay(d: Date): number {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

function startOfIsoWeekMonday(d: Date): number {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

const DAY_COUNT = 60
const WEEK_COUNT = 26
const MONTH_COUNT = 24
const MONTHS_3Y = 36
const YEAR_COUNT = 8

type RollingMonthBucket = {
  label: string
  y: number
  m0: number
  revenue: number
  startMs: number
  endMs: number
}

function buildRollingMonthBuckets(count: number, now: Date): RollingMonthBucket[] {
  const y = now.getFullYear()
  const m = now.getMonth()
  const buckets: RollingMonthBucket[] = []
  for (let idx = 0; idx < count; idx++) {
    const i = count - 1 - idx
    const first = new Date(y, m - i, 1)
    const y1 = first.getFullYear()
    const m0 = first.getMonth()
    const startMs = new Date(y1, m0, 1).getTime()
    const endMs = new Date(y1, m0 + 1, 0, 23, 59, 59, 999).getTime()
    buckets.push({
      label: format(first, 'MMM yy', { locale: appDateLocale }),
      y: y1,
      m0,
      revenue: 0,
      startMs,
      endMs,
    })
  }
  return buckets
}

function revenueFromPaidIntoRollingMonthBuckets(
  monthBuckets: RollingMonthBucket[],
  paid: InvoiceListDto[]
): RevenuePoint[] {
  for (const inv of paid) {
    const ds = effectivePaidDate(inv)
    const dt = parseISO(ds)
    if (Number.isNaN(dt.getTime())) continue
    const t = dt.getTime()
    const amount = inv.total ?? 0
    const inWindow = monthBuckets.find((b) => b.y === dt.getFullYear() && b.m0 === dt.getMonth())
    if (inWindow) {
      inWindow.revenue += amount
      continue
    }
    const firstB = monthBuckets[0]!
    const lastB = monthBuckets[monthBuckets.length - 1]!
    if (t < firstB.startMs) firstB.revenue += amount
    else if (t > lastB.endMs) lastB.revenue += amount
  }
  return monthBuckets.map(({ label, revenue }) => ({ label, revenue }))
}

export function buildRevenuePeriodSeries(
  invoices: InvoiceListDto[],
  period: RevenuePeriod,
  nowInput: Date = new Date()
): RevenuePoint[] {
  const now = new Date(nowInput)
  const paid = invoices.filter((i) => normalizeInvoiceStatus(i.status) === 'paid')
  const y = now.getFullYear()

  if (period === 'day') {
    const endDayStart = startOfLocalDay(now)
    const buckets: { label: string; startMs: number; endMs: number; revenue: number }[] = []
    for (let k = 0; k < DAY_COUNT; k++) {
      const day = new Date(endDayStart)
      day.setDate(day.getDate() - (DAY_COUNT - 1 - k))
      const startMs = startOfLocalDay(day)
      const end = new Date(startMs)
      end.setDate(end.getDate() + 1)
      end.setMilliseconds(-1)
      const label = isSameYear(day, now)
        ? format(day, 'd MMM', { locale: appDateLocale })
        : format(day, 'd MMM yy', { locale: appDateLocale })
      buckets.push({ label, startMs, endMs: end.getTime(), revenue: 0 })
    }
    for (const inv of paid) {
      const ds = effectivePaidDate(inv)
      const t = parseISO(ds).getTime()
      if (Number.isNaN(t)) continue
      addToRangeFirstLast(buckets, t, inv.total ?? 0)
    }
    return buckets.map(({ label, revenue }) => ({ label, revenue }))
  }

  if (period === 'week') {
    const thisWeekStart = startOfIsoWeekMonday(now)
    const buckets: { label: string; startMs: number; endMs: number; revenue: number }[] = []
    for (let k = 0; k < WEEK_COUNT; k++) {
      const ws = new Date(thisWeekStart)
      ws.setDate(ws.getDate() - 7 * (WEEK_COUNT - 1 - k))
      const startMs = startOfIsoWeekMonday(ws)
      const we = new Date(startMs)
      we.setDate(we.getDate() + 7)
      we.setMilliseconds(-1)
      const wEnd = new Date(startMs)
      wEnd.setDate(wEnd.getDate() + 6)
      buckets.push({
        label: formatWeekLabel(wEnd),
        startMs,
        endMs: we.getTime(),
        revenue: 0,
      })
    }
    for (const inv of paid) {
      const ds = effectivePaidDate(inv)
      const t = parseISO(ds).getTime()
      if (Number.isNaN(t)) continue
      addToRangeFirstLast(buckets, t, inv.total ?? 0)
    }
    return buckets.map(({ label, revenue }) => ({ label, revenue }))
  }

  if (period === 'month') {
    return revenueFromPaidIntoRollingMonthBuckets(buildRollingMonthBuckets(MONTH_COUNT, now), paid)
  }

  if (period === '3y') {
    return revenueFromPaidIntoRollingMonthBuckets(buildRollingMonthBuckets(MONTHS_3Y, now), paid)
  }

  if (period === 'year') {
    const buckets: { label: string; startMs: number; endMs: number; revenue: number }[] = []
    for (let k = 0; k < YEAR_COUNT; k++) {
      const yr = y - (YEAR_COUNT - 1 - k)
      const startMs = new Date(yr, 0, 1).getTime()
      const endMs = new Date(yr, 11, 31, 23, 59, 59, 999).getTime()
      buckets.push({ label: String(yr), startMs, endMs, revenue: 0 })
    }
    for (const inv of paid) {
      const ds = effectivePaidDate(inv)
      const t = parseISO(ds).getTime()
      if (Number.isNaN(t)) continue
      addToRangeFirstLast(buckets, t, inv.total ?? 0)
    }
    return buckets.map(({ label, revenue }) => ({ label, revenue }))
  }

  return []
}

function formatWeekLabel(endOfWeek: Date): string {
  return `Week of ${format(endOfWeek, 'd MMM', { locale: appDateLocale })} '${String(endOfWeek.getFullYear()).slice(2)}`
}
