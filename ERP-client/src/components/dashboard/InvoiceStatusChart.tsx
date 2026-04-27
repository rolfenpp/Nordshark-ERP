import { Box, Card, CardContent, IconButton, Typography } from '@mui/material'
import { MoreVert } from '@mui/icons-material'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '@mui/material'

export type InvoiceStatusSlice = { name: string; value: number; color: string }

export type InvoiceStatusChartProps = {
  slices: InvoiceStatusSlice[]
  total: number
}

export function InvoiceStatusChart({ slices, total }: InvoiceStatusChartProps) {
  const theme = useTheme()
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 300 }}>
            Invoice Status
          </Typography>
          <IconButton size="small" aria-label="invoice status options">
            <MoreVert />
          </IconButton>
        </Box>

        {total === 0 ? (
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
                    data={slices}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke={theme.palette.mode === 'dark' ? 'transparent' : theme.palette.background.paper}
                    strokeWidth={theme.palette.mode === 'dark' ? 0 : 2}
                  >
                    {slices.map((entry) => (
                      <Cell
                        key={entry.name}
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
                <Typography variant="h4" sx={{ fontWeight: 300, color: 'text.primary' }}>
                  {total}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
                  Total
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              {slices.map((item) => {
                const pct = total > 0 ? (item.value / total) * 100 : 0
                return (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 300 }}>
                      {item.value} ({pct.toFixed(0)}%)
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}
