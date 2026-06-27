import { Box, Card, CardContent, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { InvoiceListDto } from '@/api/invoices'
import { INVOICE_STATUSES, normalizeInvoiceStatus } from '@/lib/statusNormalize'

function labelForNormalizedStatus(s: (typeof INVOICE_STATUSES)[number]): string {
  switch (s) {
    case 'paid':
      return 'Paid'
    case 'pending':
      return 'Pending'
    case 'overdue':
      return 'Overdue'
    case 'draft':
      return 'Draft'
    default:
      return s
  }
}

function statusColor(s: (typeof INVOICE_STATUSES)[number], palette: Theme['palette']) {
  if (s === 'paid') return palette.success.main
  if (s === 'pending') return palette.warning.main
  if (s === 'overdue') return palette.error.main
  return palette.info.main
}

export type InvoicesListStatsPanelProps = {
  invoices: InvoiceListDto[]
  compact?: boolean
}

export function InvoicesListStatsPanel({ invoices, compact = false }: InvoicesListStatsPanelProps) {
  const theme = useTheme()
  const donutHeight = compact ? 152 : 188

  const { pieSlices, invoiceCount, amountRows, grandTotal, outstandingTotal, statusCounts } = useMemo(() => {
    const statusCounts = Object.fromEntries(INVOICE_STATUSES.map((s) => [s, 0])) as Record<
      (typeof INVOICE_STATUSES)[number],
      number
    >
    const statusAmounts = Object.fromEntries(INVOICE_STATUSES.map((s) => [s, 0])) as Record<
      (typeof INVOICE_STATUSES)[number],
      number
    >
    for (const inv of invoices) {
      const k = normalizeInvoiceStatus(inv.status)
      if (k in statusCounts) {
        statusCounts[k as keyof typeof statusCounts] += 1
        statusAmounts[k as keyof typeof statusAmounts] += inv.total ?? 0
      }
    }

    const pieSlices = INVOICE_STATUSES.map((s) => ({
      name: labelForNormalizedStatus(s),
      value: statusCounts[s],
      color: statusColor(s, theme.palette),
      key: s,
    })).filter((row) => row.value > 0)

    const amountRows = INVOICE_STATUSES.map((s) => ({
      name: labelForNormalizedStatus(s),
      value: statusAmounts[s],
      fill: statusColor(s, theme.palette),
    }))

    const grandTotal = invoices.reduce((sum, i) => sum + (i.total ?? 0), 0)
    const outstandingTotal = invoices
      .filter((i) => normalizeInvoiceStatus(i.status) !== 'paid')
      .reduce((sum, i) => sum + (i.total ?? 0), 0)

    return {
      pieSlices,
      invoiceCount: invoices.length,
      amountRows,
      grandTotal,
      outstandingTotal,
      statusCounts,
    }
  }, [invoices, theme.palette])

  const formatMoneyTick = (v: number) => {
    if (v === 0) return '$0'
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const strokePaper = theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper

  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'grid' },
        gridTemplateColumns: { sm: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        gap: 3,
        mb: 4,
      }}
    >
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontWeight: 300, mb: 2 }}>
            Count by status
          </Typography>
          {invoiceCount === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary" sx={{ fontWeight: 300 }}>
                No invoices yet
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ height: donutHeight, width: '100%', position: 'relative', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius={compact ? 36 : 44}
                      outerRadius={compact ? 62 : 76}
                      paddingAngle={2}
                      dataKey="value"
                      stroke={strokePaper}
                      strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                    >
                      {pieSlices.map((entry) => (
                        <Cell
                          key={entry.key}
                          fill={entry.color}
                          stroke={theme.palette.mode === 'dark' ? 'transparent' : strokePaper}
                          strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        boxShadow: theme.shadows[2],
                        color: theme.palette.text.primary,
                      }}
                      formatter={(value: number) => [value, 'Invoices']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 300, color: 'text.primary', lineHeight: 1.1 }}>
                    {invoiceCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300 }}>
                    invoices
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                {INVOICE_STATUSES.map((s) => {
                  const name = labelForNormalizedStatus(s)
                  const value = statusCounts[s]
                  const pct = invoiceCount > 0 ? (value / invoiceCount) * 100 : 0
                  const color = statusColor(s, theme.palette)
                  return (
                    <Box key={s} sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: color,
                          mr: 1,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 300 }}>
                        {name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                        {value}
                        {value > 0 ? ` (${pct.toFixed(0)}%)` : ''}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontWeight: 300, mb: 2 }}>
            Amount by status
          </Typography>
          {invoiceCount === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary" sx={{ fontWeight: 300 }}>
                No invoices yet
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ height: compact ? 200 : 232, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={amountRows}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke={theme.palette.divider}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={formatMoneyTick}
                      tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={{ stroke: theme.palette.divider }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={72}
                      tick={{ fill: theme.palette.text.primary, fontSize: 12, fontWeight: 300 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: theme.palette.action.hover }}
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        boxShadow: theme.shadows[2],
                        color: theme.palette.text.primary,
                      }}
                      formatter={(value: number) =>
                        `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      }
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Total invoiced:{' '}
                  <Box component="strong" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Box>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 300 }}>
                  Outstanding (unpaid): $
                  {outstandingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
