import { z } from 'zod'

export const aiAssistantQuestionSchema = z.object({
  question: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(1, 'Enter a question.')
        .max(4000, 'Question must be at most 4000 characters.'),
    ),
})
