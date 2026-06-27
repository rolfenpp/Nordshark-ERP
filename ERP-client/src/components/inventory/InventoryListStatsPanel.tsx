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
import type { InventoryItemDto } from '@/api/inventory'
import {
  getStockTier,
  INVENTORY_STOCK_TIERS,
  type InventoryStockTier,
} from '@/lib/inventoryStockTier'

function tierLabel(tier: InventoryStockTier): string {
  switch (tier) {
    case 'out':
      return 'Out of stock'
    case 'low':
      return 'Low stock'
    case 'inStock':
      return 'In stock'
    default:
      return tier
  }
}

/** Short labels for narrow chart columns */
function tierLabelShort(tier: InventoryStockTier): string {
  switch (tier) {
    case 'out':
      return 'Out'
    case 'low':
      return 'Low'
    case 'inStock':
      return 'In stock'
    default:
      return tier
  }
}

function tierColor(tier: InventoryStockTier, palette: Theme['palette']) {
  if (tier === 'out') return palette.error.main
  if (tier === 'low') return palette.warning.main
  return palette.success.main
}

export type InventoryListStatsPanelProps = {
  items: InventoryItemDto[]
  compact?: boolean
}

export function InventoryListStatsPanel({ items, compact = false }: InventoryListStatsPanelProps) {
  const theme = useTheme()
  const donutHeightNarrow = compact ? 140 : 168
  const unitsChartHeight = compact ? 180 : 210

  const {
    pieSlices,
    lineCount,
    tierCounts,
    amountRows,
    unitRows,
    totalUnits,
    grandValue,
    lowTierCount,
  } = useMemo(() => {
    const tierCounts = Object.fromEntries(INVENTORY_STOCK_TIERS.map((t) => [t, 0])) as Record<
      InventoryStockTier,
      number
    >
    const tierValues = Object.fromEntries(INVENTORY_STOCK_TIERS.map((t) => [t, 0])) as Record<
      InventoryStockTier,
      number
    >
    const tierUnits = Object.fromEntries(INVENTORY_STOCK_TIERS.map((t) => [t, 0])) as Record<
      InventoryStockTier,
      number
    >
    let totalUnits = 0
    for (const it of items) {
      const tier = getStockTier(it.quantityOnHand, it.reorderLevel)
      tierCounts[tier] += 1
      const qty = it.quantityOnHand ?? 0
      const lineValue = qty * (it.unitPrice ?? 0)
      tierValues[tier] += lineValue
      tierUnits[tier] += qty
      totalUnits += qty
    }

    const pieSlices = INVENTORY_STOCK_TIERS.map((t) => ({
      name: tierLabel(t),
      value: tierCounts[t],
      color: tierColor(t, theme.palette),
      key: t,
    })).filter((row) => row.value > 0)

    const amountRows = INVENTORY_STOCK_TIERS.map((t) => ({
      name: tierLabel(t),
      value: tierValues[t],
      fill: tierColor(t, theme.palette),
    }))

    const unitRows = INVENTORY_STOCK_TIERS.map((t) => ({
      name: tierLabelShort(t),
      units: tierUnits[t],
      fill: tierColor(t, theme.palette),
    }))

    const grandValue = items.reduce((s, it) => s + (it.quantityOnHand ?? 0) * (it.unitPrice ?? 0), 0)

    return {
      pieSlices,
      lineCount: items.length,
      tierCounts,
      amountRows,
      unitRows,
      totalUnits,
      grandValue,
      lowTierCount: tierCounts.low,
    }
  }, [items, theme.palette])

  const formatMoneyTick = (v: number) => {
    if (v === 0) return '$0'
    if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`
    return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  const strokePaper = theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper

  const emptyBody = (
    <Box
      sx={{
        py: 4,
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
      }}
    >
      <Typography color="text.secondary" sx={{ fontWeight: 300 }}>
        No inventory yet
      </Typography>
    </Box>
  )

  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'grid' },
        gridTemplateColumns: {
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 3,
        mb: 4,
      }}
    >
      {/* 2/4 width — valuation breakdown */}
      <Card
        sx={{
          height: '100%',
          gridColumn: { sm: '1 / -1', md: 'span 2' },
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ fontWeight: 300, mb: 2 }}>
            Value by stock level
          </Typography>
          {lineCount === 0 ? (
            emptyBody
          ) : (
            <>
              <Box sx={{ height: compact ? 220 : 252, width: '100%', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={amountRows}
                    margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
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
                      width={108}
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
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Total on-hand value:{' '}
                  <Box component="strong" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    ${grandValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Box>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontWeight: 300 }}>
                  Total units: {totalUnits.toLocaleString()} · Low-stock SKUs: {lowTierCount}
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* 1/4 width — SKU mix */}
      <Card sx={{ height: '100%', gridColumn: { sm: 'span 1', md: 'span 1' } }}>
        <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, mb: 1.5 }}>
            SKUs by level
          </Typography>
          {lineCount === 0 ? (
            emptyBody
          ) : (
            <>
              <Box sx={{ height: donutHeightNarrow, width: '100%', position: 'relative', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius={compact ? 30 : 36}
                      outerRadius={compact ? 52 : 62}
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
                      formatter={(value: number) => [value, 'SKUs']}
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
                  <Typography
                    variant={compact ? 'h5' : 'h4'}
                    sx={{ fontWeight: 300, color: 'text.primary', lineHeight: 1.1 }}
                  >
                    {lineCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300, fontSize: '0.7rem' }}>
                    SKUs
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 1.5 }}>
                {INVENTORY_STOCK_TIERS.map((t) => {
                  const value = tierCounts[t]
                  const pct = lineCount > 0 ? (value / lineCount) * 100 : 0
                  const color = tierColor(t, theme.palette)
                  return (
                    <Box key={t} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, gap: 0.5 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="caption" sx={{ flex: 1, fontWeight: 300, lineHeight: 1.2 }}>
                        {tierLabelShort(t)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 300 }}>
                        {value}
                        {value > 0 ? ` · ${pct.toFixed(0)}%` : ''}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* 1/4 width — units on hand by level */}
      <Card sx={{ height: '100%', gridColumn: { sm: 'span 1', md: 'span 1' } }}>
        <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, mb: 1.5 }}>
            Units by level
          </Typography>
          {lineCount === 0 ? (
            emptyBody
          ) : (
            <>
              <Box sx={{ height: unitsChartHeight, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitRows} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={theme.palette.divider}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: theme.palette.text.primary, fontSize: 10, fontWeight: 300 }}
                      axisLine={{ stroke: theme.palette.divider }}
                      tickLine={{ stroke: theme.palette.divider }}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                      allowDecimals={false}
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
                      formatter={(value: number) => [value.toLocaleString(), 'Units']}
                    />
                    <Bar dataKey="units" radius={[4, 4, 0, 0]} maxBarSize={40}>
                      {unitRows.map((row, i) => (
                        <Cell key={`${row.name}-${i}`} fill={row.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', pt: 1.5, fontWeight: 300 }}>
                On-hand quantity rolled up by stock health ({totalUnits.toLocaleString()} total units)
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
