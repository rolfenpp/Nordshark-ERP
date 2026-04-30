import { z } from 'zod'

export const createProjectDtoSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  client: z.string().trim().optional(),
  manager: z.string().trim().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  budget: z.number().min(0, 'Budget cannot be negative').optional(),
  tags: z.string().trim().optional(),
})
