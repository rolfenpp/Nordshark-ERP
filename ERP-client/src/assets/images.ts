function joinPublicUrl(...segments: string[]): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  const path = segments.join('/').replace(/^\/+|\/+$/g, '')
  return `${base}${path}`
}

export const nordsharkLogoUrl = joinPublicUrl('assets', 'nordshark-logo.png')

export const LOGIN_HERO_SLIDE_INTERVAL_MS = 6500

export const loginHeroSlides = [
  {
    src: joinPublicUrl('assets', 'login', 'coding.png'),
    alt: 'Developers collaborating on code',
  },
  {
    src: joinPublicUrl('assets', 'login', 'holding-ipad-login.png'),
    alt: 'Team reviewing ERP on a tablet',
  },
  {
    src: joinPublicUrl('assets', 'login', 'meeting.png'),
    alt: 'Team meeting in the office',
  },
] as const
