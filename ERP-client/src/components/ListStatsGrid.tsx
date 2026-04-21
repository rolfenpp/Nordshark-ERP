import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

export type ListStatsGridProps = {
  /** When true, stats row uses 3 columns on `md`; when false, 4 columns. */
  compact: boolean
  children: React.ReactNode
  sx?: SxProps<Theme>
}

/**
 * Responsive grid for KPI-style stat cards on list pages.
 */
export function ListStatsGrid({ compact, children, sx }: ListStatsGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: compact ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
        },
        gap: 3,
        mb: 4,
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
