/**
 * Raw Database Entity: `sales` table
 * As defined in Section 6 of Database Design
 */
export interface SaleEntity {
  id: string
  import_id: string
  quantity: number
  selling_price: number
  buyer_name: string | null
  buyer_phone: string | null
  buyer_address: string | null
  sold_at: string
  created_at: string
  updated_at: string
}

/**
 * Derived / Computed UI Model
 * Computed on-the-fly by Service Layer
 * as defined in Section 10, 11, 12 of Database Design
 */
export interface SaleWithDetails extends SaleEntity {
  importId: string // alias to import_id
  productId: string
  productName: string
  sku: string
  costPrice: number // derived from parent import.cost_price
  sellingPrice: number // alias to selling_price
  revenue: number // quantity * selling_price (Section 10)
  cost: number // quantity * parent_import.cost_price (Section 11)
  profit: number // revenue - cost (Section 12)
  soldDate: string // alias to sold_at
  createdAt: string
  buyerName: string | null
  buyerPhone: string | null
  buyerAddress: string | null
}

export type SaleRecord = SaleWithDetails

export interface SaleFormData {
  importId: string
  quantity: number
  sellingPrice: number
  soldDate: string
  buyerName?: string
  buyerPhone?: string
  buyerAddress?: string
}
