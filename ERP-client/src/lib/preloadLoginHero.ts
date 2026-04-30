import { loginHeroSlides } from '@/assets/images'

async function preloadDecodedImage(src: string): Promise<void> {
  const img = new Image()

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Hero image failed: ${src}`))
    img.src = src
    if (img.complete && img.naturalWidth > 0) resolve()
  })

  try {
    if (typeof img.decode === 'function') await img.decode()
  } catch {}
}

export async function preloadLoginHeroSlides(): Promise<void> {
  await Promise.all(loginHeroSlides.map((slide) => preloadDecodedImage(slide.src)))
}
