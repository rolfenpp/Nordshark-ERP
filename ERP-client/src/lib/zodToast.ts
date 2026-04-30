import type { ZodError } from 'zod'
import { showError } from '@/lib/toast'

export function showZodError(error: ZodError): void {
  const msg = error.issues[0]?.message ?? 'Please check your input.'
  showError(msg)
}
