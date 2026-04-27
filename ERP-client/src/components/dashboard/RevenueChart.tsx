import { Box, Card, CardContent, IconButton, Typography } from '@mui/material'
import { MoreVert } from '@mui/icons-material'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTheme } from '@mui/material'

export type RevenuePoint = { month: string; revenue: number }

export type RevenueChartProps = {
  revenueData: RevenuePoint[]
  thisMonthRevenue: number
  lastMonthRevenue: number
  growthPct: number
}

export function RevenueChart({
  revenueData,
  thisMonthRevenue,
  lastMonthRevenue,
  growthPct,
}: RevenueChartProps) {
  const theme = useTheme()
  const maxRevenue = Math.max(1, ...revenueData.map((d) => d.revenue))
  const yAxisFmt = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`)
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 300 }}>
            Revenue Overview
          </Typography>
          <IconButton size="small" aria-label="revenue options">
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.designTokens?.brand?.primary || '#667eea'} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={theme.designTokens?.brand?.secondary || '#764ba2'} stopOpacity={0.1} />
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
                  color: theme.palette.text.primary,
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                  'Revenue',
                ]}
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
  )
}
