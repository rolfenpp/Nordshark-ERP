import type { InvoiceListDto } from '@/api/invoices'
import type { ProjectDto } from '@/api/projects'
import type { InventoryItemDto } from '@/api/inventory'
import { normalizeInvoiceStatus } from '@/lib/statusNormalize'
import { formatRelativeTime } from '@/lib/dates'

export type ActivityRow = {
  id: string
  type: string
  action: string
  user: string
  time: string
  status: 'success' | 'warning' | 'error' | 'info'
  sortAt: string
}

export type ActivityListItem = Omit<ActivityRow, 'sortAt'>

export function buildActivities(
  invoices: InvoiceListDto[],
  projects: ProjectDto[],
  lowStockItems: InventoryItemDto[]
): ActivityListItem[] {
  const fromInv: ActivityRow[] = invoices.map((inv) => {
    const st = normalizeInvoiceStatus(inv.status)
    let vis: ActivityRow['status'] = 'info'
    if (st === 'paid') vis = 'success'
    else if (st === 'overdue') vis = 'error'
    else if (st === 'draft') vis = 'warning'
    return {
      id: `inv-${inv.id}`,
      type: 'invoice',
      action: `Invoice ${inv.invoiceNumber} — ${inv.clientName}`,
      user: inv.clientName,
      time: formatRelativeTime(inv.issueDate),
      status: vis,
      sortAt: inv.issueDate,
    }
  })

  const fromProj: ActivityRow[] = projects.map((p) => ({
    id: `proj-${p.id}`,
    type: 'project',
    action: `Project “${p.name}”${p.status ? ` — ${p.status}` : ''}`,
    user: p.manager || p.client || 'Project',
    time: formatRelativeTime(p.updatedUtc ?? p.createdUtc),
    status: 'info' as const,
    sortAt: p.updatedUtc ?? p.createdUtc,
  }))

  const invAlert: ActivityRow[] =
    lowStockItems.length > 0
      ? [
          {
            id: 'low-stock',
            type: 'inventory',
            action: `${lowStockItems.length} item(s) at or below reorder level`,
            user: 'Inventory',
            time: 'Review stock',
            status: 'warning' as const,
            sortAt: new Date().toISOString(),
          },
        ]
      : []

  return [...fromInv, ...fromProj, ...invAlert]
    .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
    .slice(0, 7)
    .map(({ sortAt: _s, ...rest }): ActivityListItem => rest)
}
