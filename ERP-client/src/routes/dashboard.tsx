import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Box, Alert, useTheme } from '@mui/material'
import { DashboardLayout } from '../components/DashboardLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { DashboardSkeleton } from '../components/Skeletons'
import { FadeInContent } from '../components/FadeInContent'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { RevenueChart } from '../components/dashboard/RevenueChart'
import { InvoiceStatusChart } from '../components/dashboard/InvoiceStatusChart'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { TopClients } from '../components/dashboard/TopClients'
import { useInvoices, type InvoiceListDto } from '../api/invoices'
import { useUsers } from '../api/users'
import { useProjects, type ProjectDto } from '../api/projects'
import { useInventoryItems, type InventoryItemDto } from '../api/inventory'

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
})

const INVOICE_STATUSES = ['paid', 'pending', 'overdue', 'draft'] as const
const REVENUE_CHART_MONTHS = 24

function normStatus(s: string | undefined): string {
  return (s ?? '').toLowerCase().trim()
}

function formatRelativeTime(iso: string) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return '—'
  const diffSec = Math.floor((Date.now() - t) / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d ago`
  return new Date(iso).toLocaleDateString()
}

function effectivePaidDate(inv: InvoiceListDto): string {
  return inv.paidDate ?? inv.issueDate
}

type ActivityRow = {
  id: string
  type: string
  action: string
  user: string
  time: string
  status: 'success' | 'warning' | 'error' | 'info'
  sortAt: string
}

type ActivityListItem = Omit<ActivityRow, 'sortAt'>

function buildActivities(
  invoices: InvoiceListDto[],
  projects: ProjectDto[],
  lowStockItems: InventoryItemDto[]
): ActivityListItem[] {
  const fromInv: ActivityRow[] = invoices.map((inv) => {
    const st = normStatus(inv.status)
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

function DashboardComponent() {
  const theme = useTheme()

  const { data: invoices = [], isLoading: lInv, isError: eInv, error: errInv } = useInvoices()
  const { data: users = [], isLoading: lUs, isError: eUs, error: errUs } = useUsers()
  const { data: projects = [], isLoading: lPr, isError: ePr, error: errPr } = useProjects()
  const { data: inventory = [], isLoading: lIn, isError: eIn, error: errIn } = useInventoryItems()

  const isLoading = lInv || lUs || lPr || lIn
  const firstError = [errInv, errUs, errPr, errIn].find((e) => e != null) as Error | undefined

  const {
    totalInvoices,
    totalRevenue,
    activeUsers,
    pendingAmount,
    thisMonthRevenue,
    lastMonthRevenue,
    growthPct,
    activeProjects,
    completedProjects,
    inventoryLineCount,
    stockValue,
    lowStockCount,
    revenueData,
    invoiceStatusData,
    topClients,
    recentActivities,
    invoiceStatusTotal,
  } = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()

    const payTotal = (list: InvoiceListDto[], pred: (inv: InvoiceListDto) => boolean) =>
      list.filter(pred).reduce((s, i) => s + (i.total ?? 0), 0)

    const totalRev = payTotal(invoices, (i) => normStatus(i.status) === 'paid')
    const pending = payTotal(
      invoices,
      (i) => normStatus(i.status) === 'pending' || normStatus(i.status) === 'overdue'
    )

    const inMonth = (dateStr: string, year: number, month0: number) => {
      const d = new Date(dateStr)
      return d.getFullYear() === year && d.getMonth() === month0
    }
    const paid = invoices.filter((i) => normStatus(i.status) === 'paid')
    const thisM = payTotal(paid, (i) => inMonth(effectivePaidDate(i), y, m))
    const ly = m === 0 ? y - 1 : y
    const lm = m === 0 ? 11 : m - 1
    const lastM = payTotal(paid, (i) => inMonth(effectivePaidDate(i), ly, lm))
    const growth = lastM > 0 ? ((thisM - lastM) / lastM) * 100 : thisM > 0 ? 100 : 0

    const activeProj = projects.filter((p) => normStatus(p.status) === 'active').length
    const doneProj = projects.filter((p) => normStatus(p.status) === 'completed').length

    const lineCount = inventory.length
    const value = inventory.reduce((s, it) => s + (it.quantityOnHand ?? 0) * (it.unitPrice ?? 0), 0)
    const low = inventory.filter(
      (it) =>
        it.reorderLevel != null && it.reorderLevel > 0 && (it.quantityOnHand ?? 0) <= it.reorderLevel
    )

    const monthBuckets = Array.from({ length: REVENUE_CHART_MONTHS }, (_, idx) => {
      const i = REVENUE_CHART_MONTHS - 1 - idx
      const d = new Date(y, m - i, 1)
      return {
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: 0,
        y: d.getFullYear(),
        m0: d.getMonth(),
      }
    })
    paid.forEach((inv) => {
      const ds = effectivePaidDate(inv)
      const d = new Date(ds)
      if (Number.isNaN(d.getTime())) return
      const bucket = monthBuckets.find((b) => b.y === d.getFullYear() && b.m0 === d.getMonth())
      if (bucket) bucket.revenue += inv.total ?? 0
    })
    const revChart = monthBuckets.map(({ month, revenue }) => ({ month, revenue }))

    const statusCounts = Object.fromEntries(INVOICE_STATUSES.map((s) => [s, 0])) as Record<
      (typeof INVOICE_STATUSES)[number],
      number
    >
    invoices.forEach((inv) => {
      const k = normStatus(inv.status)
      if (k in statusCounts) statusCounts[k as keyof typeof statusCounts] += 1
    })
    const byStatus = INVOICE_STATUSES.map((s) => {
      const name = s.charAt(0).toUpperCase() + s.slice(1)
      const col =
        s === 'paid'
          ? theme.palette.success.main
          : s === 'pending'
            ? theme.palette.warning.main
            : s === 'overdue'
              ? theme.palette.error.main
              : theme.palette.info.main
      return { name, value: statusCounts[s], color: col }
    })
    const statusSum = byStatus.reduce((s, it) => s + it.value, 0)

    const byClient = invoices.reduce(
      (map, inv) => {
        const n = (inv.clientName || 'Unknown').trim() || 'Unknown'
        const o = map.get(n) || { total: 0, count: 0 }
        o.total += inv.total ?? 0
        o.count += 1
        map.set(n, o)
        return map
      },
      new Map<string, { total: number; count: number }>()
    )
    const topWithAvg = [...byClient.entries()]
      .map(([name, v]) => ({
        name,
        value: v.total,
        invoices: v.count,
        avg: v.count > 0 ? v.total / v.count : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4)

    const activities = buildActivities(
      [...invoices]
        .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
        .slice(0, 5),
      [...projects].sort(
        (a, b) =>
          new Date(b.updatedUtc ?? b.createdUtc).getTime() - new Date(a.updatedUtc ?? a.createdUtc).getTime()
      ).slice(0, 3),
      low
    )

    return {
      totalInvoices: invoices.length,
      totalRevenue: totalRev,
      activeUsers: users.filter((u) => u.emailConfirmed).length,
      pendingAmount: pending,
      thisMonthRevenue: thisM,
      lastMonthRevenue: lastM,
      growthPct: growth,
      activeProjects: activeProj,
      completedProjects: doneProj,
      inventoryLineCount: lineCount,
      stockValue: value,
      lowStockCount: low.length,
      revenueData: revChart,
      invoiceStatusData: byStatus,
      topClients: topWithAvg,
      recentActivities: activities,
      invoiceStatusTotal: statusSum,
    }
  }, [invoices, users, projects, inventory, theme.palette])

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <DashboardSkeleton />
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FadeInContent delay={200} duration={800}>
          <Box>
            {firstError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {eInv && 'Some invoice data may be unavailable. '}
                {ePr && 'Some project data may be unavailable. '}
                {eIn && 'Some inventory data may be unavailable. '}
                {eUs && 'Some user data may be unavailable. '}
                {firstError?.message}
              </Alert>
            )}

            <SummaryCards
              totalInvoices={totalInvoices}
              totalRevenue={totalRevenue}
              activeUsers={activeUsers}
              pendingAmount={pendingAmount}
              activeProjects={activeProjects}
              completedProjects={completedProjects}
              inventoryLineCount={inventoryLineCount}
              lowStockCount={lowStockCount}
              stockValue={stockValue}
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
                gap: 3,
                mb: 4,
              }}
            >
              <RevenueChart
                revenueData={revenueData}
                thisMonthRevenue={thisMonthRevenue}
                lastMonthRevenue={lastMonthRevenue}
                growthPct={growthPct}
              />
              <InvoiceStatusChart slices={invoiceStatusData} total={invoiceStatusTotal} />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 3,
              }}
            >
              <RecentActivity items={recentActivities} />
              <TopClients clients={topClients} />
            </Box>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
