import { z } from 'zod'
import { optionalEmailOutbound } from './common'

export const createInvoiceLineDtoSchema = z.object({
  lineNumber: z.number().int().positive(),
  description: z.string().trim().min(1, 'Each line needs a description'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().finite().min(0, 'Unit price cannot be negative'),
})

export const createInvoiceDtoSchema = z.object({
  invoiceNumber: z.string().trim().optional(),
  issueDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  clientName: z.string().trim().min(1, 'Client name is required'),
  clientEmail: optionalEmailOutbound(),
  clientAddress: z.string().trim().optional(),
  status: z.string().optional(),
  taxRatePercent: z.number().min(0).max(100),
  terms: z.string().optional(),
  currency: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  lines: z.array(createInvoiceLineDtoSchema).min(1, 'Add at least one line item with a description'),
})

export const updateInvoiceDtoSchema = createInvoiceDtoSchema.extend({
  paymentMethod: z.string().trim().optional(),
  paidDate: z.string().optional(),
})
