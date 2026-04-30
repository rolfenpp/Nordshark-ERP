import { z } from 'zod'

export const inventoryCreateFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    category: z.string().max(100, 'Category must be 100 characters or less').optional(),
    sku: z.string().max(100, 'SKU must be 100 characters or less').optional(),
    quantityOnHand: z.number().min(0, 'Quantity must be 0 or greater'),
    reorderLevel: z.number().min(0, 'Reorder level must be 0 or greater').optional(),
    unitPrice: z.number().min(0, 'Unit price must be 0 or greater'),
    location: z.string().optional(),
    supplier: z.string().optional(),
    tags: z.string().optional(),
    isActive: z.boolean(),
    trackExpiry: z.boolean(),
    expiryDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.trackExpiry && !data.expiryDate) return false
      return true
    },
    {
      message: 'Expiry date is required when tracking expiry',
      path: ['expiryDate'],
    },
  )

export type InventoryCreateFormValues = z.infer<typeof inventoryCreateFormSchema>

export const updateInventoryItemDtoSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required'),
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(100).optional(),
  location: z.string().trim().optional(),
  supplier: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  quantityOnHand: z.number().int().min(0, 'Quantity must be 0 or greater'),
  unitPrice: z.number().finite().min(0, 'Unit price must be 0 or greater'),
  reorderLevel: z.number().int().min(0).optional(),
})
