import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { DashboardSkeleton } from '../components/Skeletons'
import { FadeInContent } from '../components/FadeInContent'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Alert
} from '@mui/material'
import {
  AttachMoney,
  Receipt,
  People,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  MoreVert,
  Work,
  Inventory2,
} from '@mui/icons-material'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useTheme } from '@mui/material'
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
  const firstError = [errInv, errUs, errPr, errIn].find(
    (e) => e != null
  ) as Error | undefined

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

    const monthBuckets: { month: string; revenue: number; y: number; m0: number }[] = []
    for (let i = REVENUE_CHART_MONTHS - 1; i >= 0; i--) {
      const d = new Date(y, m - i, 1)
      monthBuckets.push({
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue: 0,
        y: d.getFullYear(),
        m0: d.getMonth(),
      })
    }
    for (const inv of paid) {
      const ds = effectivePaidDate(inv)
      const d = new Date(ds)
      if (Number.isNaN(d.getTime())) continue
      const bucket = monthBuckets.find((b) => b.y === d.getFullYear() && b.m0 === d.getMonth())
      if (bucket) bucket.revenue += inv.total ?? 0
    }
    const revChart = monthBuckets.map(({ month, revenue }) => ({ month, revenue }))

    const statusCounts: Record<string, number> = {}
    for (const s of INVOICE_STATUSES) statusCounts[s] = 0
    for (const inv of invoices) {
      const k = normStatus(inv.status)
      if (k in statusCounts) statusCounts[k] += 1
    }
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

    const byClient = new Map<string, { total: number; count: number }>()
    for (const inv of invoices) {
      const n = (inv.clientName || 'Unknown').trim() || 'Unknown'
      const o = byClient.get(n) || { total: 0, count: 0 }
      o.total += inv.total ?? 0
      o.count += 1
      byClient.set(n, o)
    }
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
      [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5),
      [...projects]
        .sort(
          (a, b) =>
            new Date(b.updatedUtc ?? b.createdUtc).getTime() -
            new Date(a.updatedUtc ?? a.createdUtc).getTime()
        )
        .slice(0, 3),
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
    }
  }, [invoices, users, projects, inventory, theme.palette])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />
      case 'warning': return <Warning color="warning" />
      case 'error': return <Error color="error" />
      case 'info': return <Schedule color="info" />
      default: return <Schedule color="info" />
    }
  }

  const invoiceTotalForChart = invoiceStatusData.reduce((s, it) => s + it.value, 0)
  const maxRevenue = Math.max(1, ...revenueData.map((d) => d.revenue))
  const yAxisFmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`

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
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
              gap: 3, 
              mb: 3
            }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Receipt color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        {totalInvoices.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Total Invoices
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Total Revenue (paid)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <People color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        {activeUsers}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Active users (verified email)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule color="warning" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        ${pendingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Pending & overdue
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
              gap: 3, 
              mb: 4 
            }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Work color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        {activeProjects}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Active projects
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        {completedProjects}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Completed projects
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Inventory2 color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        {inventoryLineCount.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Inventory line items
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning color={lowStockCount > 0 ? 'warning' : 'action'} sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 300 }}>
                        {lowStockCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Low stock alerts
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Stock value ${stockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, 
              gap: 3, 
              mb: 4 
            }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      Revenue Overview
                    </Typography>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.designTokens?.brand?.primary || '#667eea'} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={theme.designTokens?.brand?.secondary || '#764ba2'} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          interval={1}
                          angle={-35}
                          textAnchor="end"
                          height={48}
                          tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                        />
                        <YAxis 
                          domain={[0, maxRevenue * 1.05]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                          tickFormatter={yAxisFmt}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '8px',
                            boxShadow: theme.shadows[4],
                            color: theme.palette.text.primary
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Revenue']}
                          labelStyle={{ fontWeight: 300 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={theme.designTokens?.brand?.primary || '#667eea'} 
                          strokeWidth={3}
                          fill="url(#revenueGradient)"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                  
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <Box sx={{ minWidth: { xs: '45%', sm: 'auto' } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        This month (paid)
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 300 }}>
                        ${thisMonthRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: { xs: '45%', sm: 'auto' } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Last month (paid)
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 300 }}>
                        ${lastMonthRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: { xs: '100%', sm: 'auto' }, textAlign: { xs: 'left', sm: 'inherit' } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        MoM change
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 300,
                          color: growthPct >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {lastMonthRevenue > 0 || thisMonthRevenue > 0
                          ? `${growthPct >= 0 ? '+' : ''}${growthPct.toFixed(1)}%`
                          : '—'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      Invoice Status
                    </Typography>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  {invoiceTotalForChart === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary" sx={{ fontWeight: 300 }}>
                        No invoices yet
                      </Typography>
                    </Box>
                  ) : (
                    <>
                  <Box sx={{ height: 200, width: '100%', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={invoiceStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          stroke={theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper}
                          strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                        >
                          {invoiceStatusData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              stroke={theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper}
                              strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '8px',
                            boxShadow: theme.shadows[2],
                            color: theme.palette.text.primary,
                          }}
                          formatter={(value: number) => [value, 'Invoices']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <Box sx={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Typography variant="h4" sx={{ fontWeight: 300, color: 'text.primary' }}>
                        {invoiceTotalForChart}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        Total
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    {invoiceStatusData.map((item, index) => {
                      const pct = invoiceTotalForChart > 0 ? (item.value / invoiceTotalForChart) * 100 : 0
                      return (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            backgroundColor: item.color, 
                            mr: 1 
                          }} 
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 300 }}>
                          {item.value} ({pct.toFixed(0)}%)
                        </Typography>
                      </Box>
                    )})}
                  </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>



            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
              gap: 3 
            }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 300 }}>
                      Recent Activity
                    </Typography>
                    <IconButton size="small">
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  {recentActivities.length === 0 ? (
                    <Typography color="text.secondary" sx={{ fontWeight: 300, py: 2 }}>
                      No recent activity
                    </Typography>
                  ) : (
                  <List>
                    {recentActivities.map((activity, index) => (
                      <Box key={activity.id}>
                        <ListItem
                          sx={{
                            px: 0,
                            py: 1.5,
                            minHeight: 54,
                            alignItems: 'flex-start',
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40, mt: 0.25 }}>
                            {getStatusIcon(activity.status)}
                          </ListItemIcon>
                          <Box
                            sx={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              justifyContent: 'space-between',
                              gap: { xs: 1, sm: 0 },
                              minWidth: 0,
                              width: '100%',
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500, flex: 1, mr: { xs: 0, sm: 2 }, wordBreak: 'break-word' }}>
                              {activity.action}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: { xs: 0, sm: 0 }, alignSelf: { xs: 'flex-start', sm: 'center' } }}>
                              <Avatar sx={{ width: 20, height: 20, mr: 1, fontSize: '0.75rem' }}>
                                {activity.user.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: { xs: 'normal', sm: 'nowrap' } }}>
                                {activity.user} • {activity.time}
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                        {index < recentActivities.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 300, mb: 3 }}>
                    Top clients (by revenue)
                  </Typography>
                  
                  {topClients.length === 0 ? (
                    <Typography color="text.secondary" sx={{ fontWeight: 300 }}>
                      No client data yet
                    </Typography>
                  ) : (
                  topClients.map((client, index) => (
                    <Box key={client.name} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {client.name}
                        </Typography>
                        <Chip 
                          label={`$${client.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {client.invoices} invoice{client.invoices === 1 ? '' : 's'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          Avg. ${client.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Typography>
                      </Box>
                      {index < topClients.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  )))}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </FadeInContent>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
