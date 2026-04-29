import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import {
  AUTH_LANDING_HERO_SRC,
  authLandingCardSx,
  authLandingFormColumnSx,
  authLandingFormVignettePatternSx,
  authLandingHeroColumnSx,
  authLandingHeroImageSx,
  authLandingHeroOverlayBackground,
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
        <Box sx={authLandingHeroColumnSx}>
          <Box
            component="img"
            src={AUTH_LANDING_HERO_SRC}
            alt="Team using ERP on tablet"
            loading="eager"
            decoding="async"
            width={1536}
            height={864}
            sizes="(max-width: 899px) 100vw, 48vw"
            fetchPriority="high"
            sx={authLandingHeroImageSx}
          />
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: authLandingHeroOverlayBackground,
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
