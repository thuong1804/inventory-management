export type Category = {
  id: string
  name: string
  created_at: string
  updated_at: string
  user_id?: string
}

export type Product = {
  id: string
  category_id: string
  name: string
  sku: string
  created_at: string
  updated_at: string
  user_id?: string
}

export type Import = {
  id: string
  product_id: string
  quantity: number
  cost_price: number
  imported_at: string
  created_at: string
  updated_at: string
  user_id?: string
}

export type Sale = {
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
  user_id?: string
}

export type Expense = {
  id: string
  name: string
  category: string
  amount: number
  expense_date: string
  description: string | null
  created_at: string
  updated_at: string
  user_id?: string
}

export type ProductInventory = {
  id: string
  sku: string
  name: string
  category_name: string
  total_imported: number
  total_sold: number
  remaining_quantity: number
}

export type SalesDetail = {
  id: string
  import_id: string
  user_id: string
  product_id: string
  sku: string
  product_name: string
  quantity: number
  cost_price: number
  selling_price: number
  buyer_name: string | null
  buyer_phone: string | null
  buyer_address: string | null
  total_cost: number
  revenue: number
  gross_profit: number
  sold_at: string
  created_at: string
  updated_at: string
}

export type DashboardSummary = {
  total_revenue: number
  total_cost: number
  gross_profit: number
  total_expenses: number
  net_profit: number
  total_products?: number
  total_imported?: number
  total_sold?: number
  remaining_stock?: number
  remaining_quantity?: number
}
