export type TimeRangeFilter = 'today' | 'this_week' | 'this_month' | 'last_month' | 'custom'

export interface DashboardStats {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  netProfit: number
  totalProducts: number
  productsRemaining: number
  totalExpenses: number
}

export interface RevenueChartPoint {
  date: string
  label: string
  revenue: number
  cost: number
  grossProfit: number
  netProfit: number
}

export interface TopSellingProduct {
  productId: string
  productName: string
  sku: string
  soldQuantity: number
  revenue: number
  profit: number
}

export interface ExpenseByCategory {
  category: string
  amount: number
  percentage: number
}
