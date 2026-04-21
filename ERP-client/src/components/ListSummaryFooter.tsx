import { Box, Paper } from '@mui/material'
import type { ReactNode } from 'react'

export type ListSummaryFooterProps = {
  /** Left side, e.g. “Showing X of Y …”. */
  primary: ReactNode
  /** Optional right-side summary lines (Typography nodes). */
  children?: ReactNode
}

/**
 * Footer strip under list table/cards: count line + optional stats.
 */
export function ListSummaryFooter({ primary, children }: ListSummaryFooterProps) {
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
        }}
      >
        <Box sx={{ color: 'text.secondary' }}>{primary}</Box>
        {children != null && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>{children}</Box>
        )}
      </Box>
    </Paper>
  )
}
