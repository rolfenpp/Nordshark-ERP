const INVOICE_CANON = ['paid', 'pending', 'overdue', 'draft'] as const

const PROJECT_CANON = ['active', 'planning', 'completed', 'on-hold'] as const
export type NormalizedProjectStatus = (typeof PROJECT_CANON)[number] | 'unknown'

export function normalizeInvoiceStatus(status: string | undefined | null): string {
  return (status ?? '').toLowerCase().trim()
}

export function isKnownInvoiceStatus(s: string): s is (typeof INVOICE_CANON)[number] {
  return (INVOICE_CANON as readonly string[]).includes(s)
}

export function normalizeProjectStatus(status: string | undefined | null): NormalizedProjectStatus {
  const s = (status ?? '').toLowerCase().trim()
  if (s === 'on_hold' || s === 'onhold' || s === 'on hold') return 'on-hold'
  if ((PROJECT_CANON as readonly string[]).includes(s)) {
    return s as NormalizedProjectStatus
  }
  return 'unknown'
}

export function isKnownProjectStatus(s: string): s is (typeof PROJECT_CANON)[number] {
  return (PROJECT_CANON as readonly string[]).includes(s as (typeof PROJECT_CANON)[number])
}
