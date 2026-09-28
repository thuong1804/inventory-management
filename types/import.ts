export type ImportStatus = 'available' | 'partially_sold' | 'sold_out'

/**
 * Raw Database Entity: `imports` table
 * As defined in Section 5 of Database Design
 */
export interface ImportEntity {
  id: string
  product_id: string
  quantity: number
  cost_price: number
  imported_at: string
  created_at: string
  updated_at: string
}

/**
 * Derived / Computed UI Model
 * Computed on-the-fly by Service Layer
 * as defined in Section 5 & 15 of Database Design
 */
export interface ImportWithDetails extends ImportEntity {
  productId: string // alias to product_id
  productName: string
  sku: string
  costPrice: number // alias to cost_price
  totalCost: number // quantity * cost_price (Section 5)
  importDate: string // alias to imported_at
  soldQuantity: number // SUM(sales.quantity for this import)
  remainingQuantity: number // quantity - soldQuantity (Section 6 & 9)
  status: ImportStatus // derived from remainingQuantity
  createdAt: string
}

export type ImportRecord = ImportWithDetails

export interface ImportFormData {
  productId: string
  quantity: number
  costPrice: number
  importDate: string
}
