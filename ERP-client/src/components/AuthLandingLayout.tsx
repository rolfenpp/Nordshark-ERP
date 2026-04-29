import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Box, CircularProgress, useTheme } from '@mui/material'
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
  const theme = useTheme()
  const mdQuery = `(min-width:${theme.breakpoints.values.md}px)`

  const [desktopHero, setDesktopHero] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(mdQuery).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(mdQuery)
    setDesktopHero(mq.matches)
    const sync = () => setDesktopHero(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [mdQuery])

  const [heroLoaded, setHeroLoaded] = useState(() =>
    typeof window !== 'undefined' ? !window.matchMedia(mdQuery).matches : false,
  )

  useEffect(() => {
    if (!desktopHero) {
      setHeroLoaded(true)
      return
    }
    setHeroLoaded(false)
    let cancelled = false
    const img = new Image()
    const finish = () => {
      if (!cancelled) setHeroLoaded(true)
    }
    img.onload = finish
    img.onerror = finish
    img.src = AUTH_LANDING_HERO_SRC
    if (img.complete && img.naturalWidth > 0) finish()
    return () => {
      cancelled = true
    }
  }, [desktopHero])

  if (!heroLoaded) {
    return (
      <Box
        sx={{
          ...authLandingPageSx,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress aria-label="Loading sign-in screen" disableShrink />
      </Box>
    )
  }

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

