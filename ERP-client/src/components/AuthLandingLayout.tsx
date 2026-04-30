import { type ReactNode, useEffect, useState } from 'react'
import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ThreeDot } from 'react-loading-indicators'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { LOGIN_HERO_SLIDE_INTERVAL_MS, loginHeroSlides } from '@/assets/images'
import { preloadLoginHeroSlides } from '@/lib/preloadLoginHero'
import {
  authLandingCardSx,
  authLandingFormColumnSx,
  authLandingFormVignettePatternSx,
  authLandingHeroColumnSx,
  authLandingHeroImageSx,
  authLandingHeroMediaFrameSx,
  authLandingHeroOverlaySx,
  authLandingHeroSwiperShellSx,
  authLandingNoisePatternSx,
  authLandingPageSx,
} from '@/theme/authLanding.styles'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

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

function AuthHeroStaticImage() {
  const slide = loginHeroSlides[0]
  return (
    <Box
      component="img"
      src={slide.src}
      alt={slide.alt}
      loading="eager"
      decoding="async"
      width={1536}
      height={864}
      sizes="(max-width: 899px) 100vw, 48vw"
      fetchPriority="high"
      sx={{
        ...authLandingHeroImageSx,
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  )
}

export function AuthLandingLayout({ children, contentMaxWidth }: AuthLandingLayoutProps) {
  const theme = useTheme()
  const [heroAssetsReady, setHeroAssetsReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fallthrough = window.setTimeout(() => {
      if (!cancelled) setHeroAssetsReady(true)
    }, 30_000)

    void preloadLoginHeroSlides()
      .then(() => {
        if (!cancelled) setHeroAssetsReady(true)
      })
      .catch(() => {
        if (!cancelled) setHeroAssetsReady(true)
      })
      .finally(() => {
        window.clearTimeout(fallthrough)
      })

    return () => {
      cancelled = true
      window.clearTimeout(fallthrough)
    }
  }, [])

  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)', {
    defaultMatches: false,
  })

  if (!heroAssetsReady) {
    return (
      <Box
        role="status"
        aria-live="polite"
        aria-busy="true"
        sx={{
          ...authLandingPageSx,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ThreeDot
          color={theme.palette.primary.main}
          size="medium"
          text=""
          textColor=""
          aria-label="Loading"
        />
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
            sx={{
              ...authLandingHeroMediaFrameSx,
              ...authLandingHeroSwiperShellSx,
            }}
          >
            {prefersReducedMotion ? (
              <AuthHeroStaticImage />
            ) : (
              <Swiper
                className="auth-hero-swiper"
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop={loginHeroSlides.length > 1}
                speed={1100}
                autoplay={{
                  delay: LOGIN_HERO_SLIDE_INTERVAL_MS,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                slidesPerView={1}
                pagination={{
                  clickable: true,
                  dynamicBullets: false,
                }}
              >
                {loginHeroSlides.map((slide, i) => (
                  <SwiperSlide key={slide.src}>
                    <Box
                      component="img"
                      src={slide.src}
                      alt={slide.alt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      width={1536}
                      height={864}
                      sizes="(max-width: 899px) 100vw, 48vw"
                      fetchPriority={i === 0 ? 'high' : 'auto'}
                      sx={{
                        ...authLandingHeroImageSx,
                        display: 'block',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
            <Box aria-hidden sx={authLandingHeroOverlaySx} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
