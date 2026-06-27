export const INVENTORY_STOCK_TIERS = ['out', 'low', 'inStock'] as const

export type InventoryStockTier = (typeof INVENTORY_STOCK_TIERS)[number]

/** Matches table filters: out (qty 0), low (qty above 0 and at or under reorder), else in stock. */
export function getStockTier(quantityOnHand: number, reorderLevel?: number): InventoryStockTier {
  if (quantityOnHand === 0) return 'out'
  if (reorderLevel && quantityOnHand <= reorderLevel) return 'low'
  return 'inStock'
}
