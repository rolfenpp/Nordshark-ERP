import { z } from 'zod'

export const trimmedEmailSchema = () =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(1, 'Enter your email.')
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'),
    )

export const optionalEmailOutbound = () =>
  z.preprocess(
    (v) => {
      if (v == null || v === '') return undefined
      const s = String(v).trim()
      return s === '' ? undefined : s
    },
    z
      .string()
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.')
      .optional(),
  )
