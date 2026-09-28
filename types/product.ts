export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

/**
 * Raw Database Entity: `products` table
 * As defined in Section 4 of Database Design
 */
export interface ProductEntity {
  id: string
  category_id: string
  name: string
  sku: string
  created_at: string
  updated_at: string
}

/**
 * Derived / Computed UI Model
 * Computed on-the-fly by Service Layer from imports and sales
 * as defined in Section 8 & 15 of Database Design
 */
export interface ProductWithStock extends ProductEntity {
  category: string // Category name for UI display & backward compatibility
  categoryName: string
  totalImported: number // SUM(imports.quantity)
  totalSold: number // SUM(sales.quantity)
  remainingQuantity: number // totalImported - totalSold
  createdAt: string // alias to created_at
  updatedAt: string // alias to updated_at
}

export type Product = ProductWithStock

export interface ProductFilter {
  search?: string
  categoryId?: string
  category?: string
  stockStatus?: StockStatus | 'all'
}
