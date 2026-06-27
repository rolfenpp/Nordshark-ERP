import { type ReactNode } from 'react'
import { Box } from '@mui/material'
import {
  authLandingCardSx,
  authLandingFormColumnSx,
  authLandingFormVignettePatternSx,
  authLandingNoisePatternSx,
  authLandingPageSx,
} from '@/theme/authLanding.styles'

function AuthLandingNoiseAndVignette() {
  return (
    <>
      <Box aria-hidden sx={authLandingNoisePatternSx} />
      <Box aria-hidden sx={authLandingFormVignettePatternSx} />
    </>
  )
}

type AuthLandingLayoutProps = {
  children: ReactNode
  contentMaxWidth: number | string
}

export function AuthLandingLayout({ children, contentMaxWidth }: AuthLandingLayoutProps) {
  return (
    <Box sx={authLandingPageSx}>
      <Box sx={authLandingCardSx}>
        <Box sx={authLandingFormColumnSx}>
          <AuthLandingNoiseAndVignette />
          <Box
            sx={{
              width: '100%',
              maxWidth: contentMaxWidth,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
