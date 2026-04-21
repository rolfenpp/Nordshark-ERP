import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

export interface PageHeaderProps {
  title: React.ReactNode
  actions?: React.ReactNode
  sx?: SxProps<Theme>
}

export function SectionHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Typography variant="h6" component="h2" sx={{ fontWeight: 300 }}>
        {title}
      </Typography>
      {actions != null && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 1.5,
            '& > .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' },
              minHeight: { xs: 44, sm: undefined },
            },
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  )
}

export function PageHeader({ title, actions, sx }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
        ...sx,
      }}
    >
      <Typography
        component="h1"
        variant="h4"
        sx={{
          fontWeight: 300,
          fontSize: { xs: '1.35rem', sm: '2rem' },
          lineHeight: 1.25,
          wordBreak: 'break-word',
        }}
      >
        {title}
      </Typography>
      {actions != null && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'stretch',
            width: { xs: '100%', sm: 'auto' },
            minWidth: 0,
            '& > .MuiButton-root': {
              width: { xs: '100%', sm: 'auto' },
              minHeight: { xs: 44, sm: undefined },
            },
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  )
}
