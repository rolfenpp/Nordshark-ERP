import {
  borderRadius,
  colors,
  gradients,
  navChrome,
  spacing,
  typography,
} from '@/theme/theme'

export const AUTH_LANDING_HERO_SRC = '/holding-ipad-login.png'

export const authLandingPageSx = {
  boxSizing: 'border-box',
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  px: 0,
  py: 0,
  gap: 0,
  overflow: 'auto',
  bgcolor: colors.light.canvas,
  backgroundImage: `radial-gradient(ellipse 115% 70% at 50% -15%, ${colors.primary[50]} 0%, transparent 50%),
    linear-gradient(168deg, ${colors.primary[50]} 0%, ${colors.light.canvas} 40%, ${colors.light.borderMuted} 100%)`,
}

export const authLandingCardSx = {
  width: '100%',
  maxWidth: '100%',
  mx: 0,
  flexShrink: 0,
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  alignItems: 'stretch',
  minHeight: '100dvh',
  maxHeight: { xs: '100dvh', md: 'none' },
  borderRadius: borderRadius.none,
  overflow: 'hidden',
  boxShadow: 'none',
  bgcolor: navChrome.background,
}

export const authLandingHeroColumnSx = {
  display: { xs: 'none', md: 'block' },
  position: 'relative' as const,
  flex: { md: '1 1 50%' },
  minHeight: { xs: 0, md: '100%' },
  overflow: 'hidden',
}

export const authLandingFormColumnSx = {
  flex: { xs: '1 1 0%', md: '1 1 50%' },
  minHeight: { xs: 0, md: '100%' },
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: { xs: 3, sm: 5, md: 6, lg: 8 },
  py: { xs: 4, md: spacing.xxl },
  pt: {
    xs: `max(${spacing.lg}, env(safe-area-inset-top))`,
    md: spacing.xxl,
  },
  pb: {
    xs: `max(${spacing.lg}, env(safe-area-inset-bottom))`,
    md: spacing.xxl,
  },
  bgcolor: navChrome.background,
  position: 'relative',
  overflowX: 'hidden',
  overflowY: 'auto',
  isolation: 'isolate',
}

export const authLandingNoiseDataUrlEncoded = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.45"/></svg>',
)

export const authLandingDarkUnderlineSx = {
  '& .MuiInput-root': {
    color: colors.text.primary,
    fontSize: typography.body1.fontSize,
    marginTop: 0,
    paddingTop: 0,
  },
  '& .MuiInputBase-input': {
    paddingTop: '2px',
    paddingBottom: '6px',
  },
  '& .MuiInputBase-input::placeholder': {
    color: colors.text.tertiary,
    opacity: 1,
  },
  '& .MuiInput-underline:before': {
    borderBottomColor: colors.surface.divider,
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottomColor: colors.text.secondary,
  },
  '& .MuiInput-underline:after': {
    borderBottomWidth: '2px',
    borderBottomColor: colors.primary[400],
  },
} as const

export const authLandingHeroImageSx = {
  display: 'block',
  width: '100%',
  height: '100%',
  minHeight: '100%',
  objectFit: 'cover',
  objectPosition: 'center top',
  filter: 'grayscale(1) contrast(1.06) brightness(0.88)',
} as const

export const authLandingHeroOverlayBackground = [
  `linear-gradient(90deg,
    color-mix(in srgb, ${colors.background.primary} 78%, transparent) 0%,
    color-mix(in srgb, ${colors.background.secondary} 42%, transparent) 38%,
    color-mix(in srgb, ${colors.text.inverse} 18%, transparent) 68%,
    color-mix(in srgb, ${colors.text.inverse} 6%, transparent) 100%)`,
  `linear-gradient(180deg,
    color-mix(in srgb, ${colors.text.inverse} 28%, transparent) 0%,
    color-mix(in srgb, ${colors.text.inverse} 8%, transparent) 42%,
    color-mix(in srgb, ${colors.text.inverse} 32%, transparent) 100%)`,
  `linear-gradient(135deg,
    color-mix(in srgb, ${colors.light.paper} 4%, transparent) 0%,
    transparent 50%,
    color-mix(in srgb, ${colors.text.inverse} 15%, transparent) 100%)`,
].join(',')

export const authLandingNoisePatternSx = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  backgroundImage: `url("data:image/svg+xml,${authLandingNoiseDataUrlEncoded}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '256px 256px',
  opacity: 0.52,
  mixBlendMode: 'soft-light',
} as const

export const authLandingFormVignettePatternSx = {
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  background: `radial-gradient(ellipse 85% 70% at 50% -10%, color-mix(in srgb, ${colors.light.paper} 5%, transparent) 0%, transparent 55%)`,
  opacity: 0.9,
} as const
export const authLandingAlertErrorSx = {
  borderRadius: borderRadius.sm,
  typography: 'body2',
  bgcolor: `color-mix(in srgb, ${colors.status.error} 20%, transparent)`,
  color: colors.status.errorLight,
  border: `1px solid color-mix(in srgb, ${colors.status.error} 45%, transparent)`,
  '& .MuiAlert-icon': {
    color: colors.status.errorLight,
  },
} as const

export const authLandingPrimarySubmitSx = {
  mt: 1,
  py: 1.7,
  fontWeight: 700,
  fontSize: '0.925rem',
  letterSpacing: '0.14em',
  borderRadius: 0,
  textTransform: 'uppercase',
  background: gradients.primary,
  color: colors.light.paper,
  '&:hover': {
    background: gradients.secondary,
    boxShadow: 'none',
  },
  '&:disabled': {
    color: colors.light.paper,
    opacity: 0.7,
  },
} as const

export const authLandingMutedDividerCaptionSx = {
  color: colors.text.secondary,
  opacity: 0.55,
  textAlign: 'center',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
} as const

export const authLandingGoogleOutlinedButtonSx = {
  py: 1.4,
  fontWeight: 500,
  borderRadius: 0,
  textTransform: 'none',
  color: colors.text.secondary,
  borderColor: `color-mix(in srgb, ${colors.text.primary} 35%, transparent)`,
  '&:hover': {
    borderColor: colors.primary[400],
    backgroundColor: colors.interactive.hover,
  },
} as const

export const authLandingFooterLinkButtonSx = {
  color: colors.text.secondary,
  fontWeight: 500,
  fontSize: '0.875rem',
  textTransform: 'none',
  borderBottom: '1px solid transparent',
  borderRadius: borderRadius.none,
  '&:hover': {
    color: colors.primary[300],
    bgcolor: 'transparent',
    borderBottomColor: colors.primary[400],
  },
} as const
