import { z } from 'zod'
import { trimmedEmailSchema } from './common'

export const loginRequestSchema = z.object({
  email: trimmedEmailSchema(),
  password: z.string().min(1, 'Enter your password.'),
})

/** Validates register form (+ confirm password); output matches `RegisterCompanyRequest` */
export const registerWorkspaceFormSchema = z
  .object({
    companyName: z
      .string()
      .transform((s) => s.trim())
      .pipe(z.string().min(1, 'Enter your company name.')),
    adminEmail: trimmedEmailSchema(),
    adminPassword: z.string().min(1, 'Enter a password.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .transform(({ companyName, adminEmail, adminPassword }) => ({
    name: companyName,
    adminEmail,
    adminPassword,
  }))

export type RegisterCompanyBody = z.output<typeof registerWorkspaceFormSchema>
