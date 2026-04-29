import { Box, Paper } from '@mui/material'
import type { ReactNode } from 'react'

export type ListPageToolbarProps = {
  search: ReactNode
  filters?: ReactNode
  actions?: ReactNode
}

export function ListPageToolbar({ search, filters, actions }: ListPageToolbarProps) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <Box
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 0%' },
            minWidth: 0,
          }}
        >
          {search}
        </Box>

        {filters && (
          <Box
            sx={{
              flex: '0 0 auto',
              width: { xs: '100%', sm: 200 },
              maxWidth: '100%',
            }}
          >
            {filters}
          </Box>
        )}

        {actions && (
          <Box
            sx={{
              flex: { xs: '1 1 100%', sm: '0 0 auto' },
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              alignSelf: 'center',
              '& .MuiButton-root': {
                flex: { xs: '1 1 auto', sm: '0 0 auto' },
                minWidth: { xs: 0, sm: 'unset' },
                whiteSpace: 'nowrap',
              },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Paper>
  )
}
