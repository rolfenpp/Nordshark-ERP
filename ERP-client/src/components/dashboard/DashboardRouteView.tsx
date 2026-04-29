import { useMemo, useState } from 'react'
import { Box, Alert, useTheme } from '@mui/material'
import { FadeInContent } from '@/components/FadeInContent'
import { SummaryCards, type InvoiceStatusSlice } from './SummaryCards'
import { RevenueChart } from './RevenueChart'
import { InvoiceStatusChart } from './InvoiceStatusChart'
import { RecentActivity } from './RecentActivity'
import { TopClients } from './TopClients'
import type { InvoiceListDto } from '@/api/invoices'
import type { ProjectDto } from '@/api/projects'
import type { InventoryItemDto } from '@/api/inventory'
import { INVOICE_STATUSES, normalizeInvoiceStatus } from '@/lib/statusNormalize'
import {
  buildRevenuePeriodSeries,
  effectivePaidDate,
  type RevenuePeriod,
} from '@/lib/revenuePeriodSeries'
import { parseApiDate } from '@/lib/dates'
import { buildActivities } from './dashboardRouteHelpers'

export type DashboardRouteViewProps = {
  invoices: InvoiceListDto[]
  projects: ProjectDto[]
  inventory: InventoryItemDto[]
  firstError: Error | undefined
  eInv: boolean
  eUs: boolean
  ePr: boolean
  eIn: boolean
}

export function DashboardRouteView({
  invoices,
  projects,
  inventory,
  firstError,
  eInv,
  eUs,
  ePr,
  eIn,
}: DashboardRouteViewProps) {
  const theme = useTheme()
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('month')

  const {
    totalInvoices,
    totalRevenue,
    pendingAmount,
    thisMonthRevenue,
    lastMonthRevenue,
    growthPct,
    inventoryLineCount,
    stockValue,
    lowStockCount,
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

    const totalRev = payTotal(invoices, (i) => normalizeInvoiceStatus(i.status) === 'paid')
    const pending = payTotal(
      invoices,
      (i) =>
        normalizeInvoiceStatus(i.status) === 'pending' || normalizeInvoiceStatus(i.status) === 'overdue'
    )

    const inMonth = (dateStr: string, year: number, month0: number) => {
      const d = parseApiDate(dateStr)
      if (d == null) return false
      return d.getFullYear() === year && d.getMonth() === month0
    }
    const paid = invoices.filter((i) => normalizeInvoiceStatus(i.status) === 'paid')
    const thisM = payTotal(paid, (i) => inMonth(effectivePaidDate(i), y, m))
    const ly = m === 0 ? y - 1 : y
    const lm = m === 0 ? 11 : m - 1
    const lastM = payTotal(paid, (i) => inMonth(effectivePaidDate(i), ly, lm))
    const growth = lastM > 0 ? ((thisM - lastM) / lastM) * 100 : thisM > 0 ? 100 : 0

    const lineCount = inventory.length
    const value = inventory.reduce((s, it) => s + (it.quantityOnHand ?? 0) * (it.unitPrice ?? 0), 0)
    const low = inventory.filter(
      (it) =>
        it.reorderLevel != null && it.reorderLevel > 0 && (it.quantityOnHand ?? 0) <= it.reorderLevel
    )

    const statusCounts = Object.fromEntries(INVOICE_STATUSES.map((s) => [s, 0])) as Record<
      (typeof INVOICE_STATUSES)[number],
      number
    >
    invoices.forEach((inv) => {
      const k = normalizeInvoiceStatus(inv.status)
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
        .sort(
          (a, b) =>
            (parseApiDate(b.issueDate)?.getTime() ?? 0) - (parseApiDate(a.issueDate)?.getTime() ?? 0)
        )
        .slice(0, 5),
      [...projects]
        .sort(
          (a, b) =>
            (parseApiDate(b.updatedUtc ?? b.createdUtc)?.getTime() ?? 0) -
            (parseApiDate(a.updatedUtc ?? a.createdUtc)?.getTime() ?? 0)
        )
        .slice(0, 3),
      low
    )

    return {
      totalInvoices: invoices.length,
      totalRevenue: totalRev,
      pendingAmount: pending,
      thisMonthRevenue: thisM,
      lastMonthRevenue: lastM,
      growthPct: growth,
      inventoryLineCount: lineCount,
      stockValue: value,
      lowStockCount: low.length,
      invoiceStatusData: byStatus,
      topClients: topWithAvg,
      recentActivities: activities,
      invoiceStatusTotal: statusSum,
    }
  }, [invoices, projects, inventory, theme.palette])

  const revenueData = useMemo(
    () => buildRevenuePeriodSeries(invoices, revenuePeriod),
    [invoices, revenuePeriod],
  )

  const revenueSparkline = useMemo(() => buildRevenuePeriodSeries(invoices, 'month').slice(-6), [invoices])

  const invoiceStatusSlices = useMemo((): InvoiceStatusSlice[] => {
    const shortLabel = (name: string) => {
      if (name === 'Pending') return 'Pend.'
      if (name === 'Overdue') return 'Over.'
      if (name === 'Draft') return 'Drft.'
      return 'Paid'
    }
    return invoiceStatusData.map((d) => ({
      name: d.name,
      value: d.value,
      color: d.color,
      shortLabel: shortLabel(d.name),
    }))
  }, [invoiceStatusData])

  return (
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
          pendingAmount={pendingAmount}
          lowStockCount={lowStockCount}
          stockValue={stockValue}
          inventoryLineCount={inventoryLineCount}
          revenueSparkline={revenueSparkline}
          invoiceStatusSlices={invoiceStatusSlices}
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
            period={revenuePeriod}
            onPeriodChange={setRevenuePeriod}
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
  )
}
