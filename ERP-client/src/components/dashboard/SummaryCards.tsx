import { useId } from 'react'
import { Box, Card, CardContent, Typography } from '@mui/material'
import {
  Receipt,
  AttachMoney,
  Schedule,
  Warning,
} from '@mui/icons-material'
import { useTheme } from '@mui/material'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export type InvoiceStatusSlice = {
  name: string
  shortLabel: string
  value: number
  color: string
}

export type SummaryCardsProps = {
  totalInvoices: number
  totalRevenue: number
  pendingAmount: number
  lowStockCount: number
  stockValue: number
  inventoryLineCount: number
  revenueSparkline: { label: string; revenue: number }[]
  invoiceStatusSlices: InvoiceStatusSlice[]
}

const grid = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
  gap: 3,
  mb: 4,
} as const

const CHART_H = 76

function MiniInvoiceStatusBar({ slices }: { slices: InvoiceStatusSlice[] }) {
  const theme = useTheme()
  const data = slices.filter((s) => s.value > 0)
  if (data.length === 0) {
    return (
      <Box
        sx={{
          height: CHART_H,
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 1,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300 }}>
          No data
        </Typography>
      </Box>
    )
  }
  return (
    <Box sx={{ height: CHART_H, width: '100%', mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 2, right: 8, left: 0, bottom: 2 }}
          barCategoryGap={4}
        >
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis
            type="category"
            dataKey="shortLabel"
            width={40}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
          />
          <Tooltip
            cursor={false}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              fontSize: 12,
            }}
            formatter={(v: number) => [v, 'Invoices']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {data.map((s) => (
              <Cell key={s.shortLabel} fill={s.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

function MiniRevenueSparkline({ points }: { points: { label: string; revenue: number }[] }) {
  const theme = useTheme()
  const gradId = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const maxRev = Math.max(1, ...points.map((p) => p.revenue))
  return (
    <Box sx={{ height: CHART_H, width: '100%', mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.55} />
              <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis hide domain={[0, maxRev * 1.1]} />
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Paid']}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            fill={`url(#${gradId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}

function MiniCashflowBars({ paidTotal, pendingTotal }: { paidTotal: number; pendingTotal: number }) {
  const theme = useTheme()
  const data = [{ label: ' ', paid: paidTotal, pending: pendingTotal }]
  const maxStack = Math.max(1, paidTotal + pendingTotal)
  return (
    <Box sx={{ height: CHART_H, width: '100%', mt: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
          barCategoryGap={0}
        >
          <XAxis type="number" domain={[0, maxStack]} hide />
          <YAxis type="category" dataKey="label" width={0} hide />
          <Tooltip
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
              name === 'paid' ? 'Paid (lifetime)' : 'Pending & overdue',
            ]}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              fontSize: 12,
            }}
          />
          <Bar dataKey="paid" stackId="a" fill={theme.palette.success.main} radius={[0, 0, 0, 0]} />
          <Bar dataKey="pending" stackId="a" fill={theme.palette.warning.main} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

function MiniStockDonut({ lowCount, lineCount }: { lowCount: number; lineCount: number }) {
  const theme = useTheme()
  const ok = Math.max(0, lineCount - lowCount)
  const data = [
    { name: 'OK', value: ok, fill: theme.palette.success.main },
    { name: 'Low', value: lowCount, fill: theme.palette.warning.main },
  ].filter((d) => d.value > 0)
  if (data.length === 0 || lineCount === 0) {
    return (
      <Box
        sx={{
          height: CHART_H,
          mt: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300 }}>
          No inventory rows
        </Typography>
      </Box>
    )
  }
  return (
    <Box sx={{ height: CHART_H, width: '100%', mt: 1, mx: 'auto', maxWidth: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={22}
            outerRadius={36}
            paddingAngle={2}
            dataKey="value"
            stroke={theme.palette.background.paper}
            strokeWidth={1}
          >
            {data.map((e) => (
              <Cell key={e.name} fill={e.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [v, 'SKUs']}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}

export function SummaryCards({
  totalInvoices,
  totalRevenue,
  pendingAmount,
  lowStockCount,
  stockValue,
  inventoryLineCount,
  revenueSparkline,
  invoiceStatusSlices,
}: SummaryCardsProps) {
  return (
    <Box sx={grid}>
      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
            <Receipt color="primary" sx={{ mr: 1.5, mt: 0.25 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 300, lineHeight: 1.2 }}>
                {totalInvoices.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                Total invoices
              </Typography>
            </Box>
          </Box>
          <MiniInvoiceStatusBar slices={invoiceStatusSlices} />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
            <AttachMoney color="success" sx={{ mr: 1.5, mt: 0.25 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 300, lineHeight: 1.2 }}>
                ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                Total revenue (paid)
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300, display: 'block' }}>
                Recent paid months
              </Typography>
            </Box>
          </Box>
          <MiniRevenueSparkline points={revenueSparkline} />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
            <Schedule color="warning" sx={{ mr: 1.5, mt: 0.25 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 300, lineHeight: 1.2 }}>
                ${pendingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                Pending &amp; overdue
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300, display: 'block' }}>
                vs lifetime paid total
              </Typography>
            </Box>
          </Box>
          <MiniCashflowBars paidTotal={totalRevenue} pendingTotal={pendingAmount} />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
            <Warning color={lowStockCount > 0 ? 'warning' : 'action'} sx={{ mr: 1.5, mt: 0.25 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 300, lineHeight: 1.2 }}>
                {lowStockCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                Low stock alerts
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300, display: 'block' }}>
                Stock value ${stockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </Typography>
            </Box>
          </Box>
          <MiniStockDonut lowCount={lowStockCount} lineCount={inventoryLineCount} />
        </CardContent>
      </Card>
    </Box>
  )
}
