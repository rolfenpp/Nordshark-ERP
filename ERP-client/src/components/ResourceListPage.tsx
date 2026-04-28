import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { FadeInContent } from './FadeInContent'

export type ResourceListPageProps = {
  actions?: ReactNode
  children: ReactNode
  fadeDelay?: number
  fadeDuration?: number
}

export function ResourceListPage({
  actions,
  children,
  fadeDelay,
  fadeDuration,
}: ResourceListPageProps) {
  return (
    <FadeInContent delay={fadeDelay ?? 100} duration={fadeDuration ?? 600}>
      <Box>
        {actions && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'stretch',
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              mb: 2,
              width: '100%',
              '& .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' },
                minHeight: { xs: 44, sm: undefined },
              },
            }}
          >
            {actions}
          </Box>
        )}
        {children}
      </Box>
    </FadeInContent>
  )
}
