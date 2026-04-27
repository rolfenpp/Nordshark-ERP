import { Box, Card, CardContent, Typography } from '@mui/material'
import {
  AttachMoney,
  Receipt,
  People,
  Schedule,
  CheckCircle,
  Warning,
  Work,
  Inventory2,
} from '@mui/icons-material'

type SummaryCard = {
  key: string
  Icon: typeof Receipt
  iconColor: 'primary' | 'success' | 'info' | 'warning' | 'action'
  value: string
  label: string
  sublabel?: string
  warning?: boolean
}

export type SummaryCardsProps = {
  totalInvoices: number
  totalRevenue: number
  activeUsers: number
  pendingAmount: number
  activeProjects: number
  completedProjects: number
  inventoryLineCount: number
  lowStockCount: number
  stockValue: number
}

const grid = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
  gap: 3,
} as const

function cardConfigs(p: SummaryCardsProps): { row1: SummaryCard[]; row2: SummaryCard[] } {
  return {
    row1: [
      {
        key: 'inv',
        Icon: Receipt,
        iconColor: 'primary',
        value: p.totalInvoices.toLocaleString(),
        label: 'Total Invoices',
      },
      {
        key: 'rev',
        Icon: AttachMoney,
        iconColor: 'success',
        value: `$${p.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        label: 'Total Revenue (paid)',
      },
      {
        key: 'usr',
        Icon: People,
        iconColor: 'info',
        value: String(p.activeUsers),
        label: 'Active users (verified email)',
      },
      {
        key: 'pend',
        Icon: Schedule,
        iconColor: 'warning',
        value: `$${p.pendingAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        label: 'Pending & overdue',
      },
    ],
    row2: [
      {
        key: 'actp',
        Icon: Work,
        iconColor: 'primary',
        value: String(p.activeProjects),
        label: 'Active projects',
      },
      {
        key: 'comp',
        Icon: CheckCircle,
        iconColor: 'success',
        value: String(p.completedProjects),
        label: 'Completed projects',
      },
      {
        key: 'line',
        Icon: Inventory2,
        iconColor: 'info',
        value: p.inventoryLineCount.toLocaleString(),
        label: 'Inventory line items',
      },
      {
        key: 'low',
        Icon: Warning,
        iconColor: 'action',
        value: String(p.lowStockCount),
        label: 'Low stock alerts',
        sublabel: `Stock value $${p.stockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        warning: p.lowStockCount > 0,
      },
    ],
  }
}

function SummaryCardView({ c }: { c: SummaryCard }) {
  const { Icon, iconColor, value, label, sublabel, warning } = c
  const resolvedColor = c.key === 'low' && warning ? 'warning' : iconColor
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon color={resolvedColor} sx={{ mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 300 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 300 }}>
              {label}
            </Typography>
            {sublabel != null && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {sublabel}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export function SummaryCards(props: SummaryCardsProps) {
  const { row1, row2 } = cardConfigs(props)
  return (
    <>
      <Box sx={{ ...grid, mb: 3 }}>
        {row1.map((c) => (
          <SummaryCardView key={c.key} c={c} />
        ))}
      </Box>
      <Box sx={{ ...grid, mb: 4 }}>
        {row2.map((c) => (
          <SummaryCardView key={c.key} c={c} />
        ))}
      </Box>
    </>
  )
}
