import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

export type ListStatsGridProps = {
  compact: boolean
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export function ListStatsGrid({ compact, children, sx }: ListStatsGridProps) {
  return (
    <Box
      sx={{
        display: { xs: 'none', sm: 'grid' },
        gridTemplateColumns: {
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
