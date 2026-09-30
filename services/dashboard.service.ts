import {
  DashboardStats,
  RevenueChartPoint,
  TopSellingProduct,
  ExpenseByCategory,
  TimeRangeFilter,
} from '@/types/dashboard'
import { DashboardSummary } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { storage } from './storage'
import { saleService } from './sale.service'
import { expenseService } from './expense.service'
import { productService } from './product.service'
import { importService } from './import.service'
import {
  isToday,
  isThisWeek,
  isThisMonth,
  subMonths,
  isSameMonth,
  parseISO,
  format,
} from 'date-fns'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  return (
    url.length > 0 &&
    !url.includes('your-project') &&
    key.length > 0 &&
    !key.includes('your-publishable')
  )
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('dashboard_summary')
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    if (isSupabaseConfigured()) {
      try {
        const [summary, products, imports] = await Promise.all([
          getDashboardSummary().catch((err) => {
            console.warn('Supabase dashboard summary view error:', err)
            return null
          }),
          productService.getAll().catch((err) => {
            console.warn('Supabase products error:', err)
            return []
          }),
          importService.getAll().catch((err) => {
            console.warn('Supabase imports error:', err)
            return []
          }),
        ])

        if (summary) {
          const importsRemaining = imports.reduce(
            (acc, imp) => acc + (imp.remainingQuantity || 0),
            0
          )
          const productsRemainingFromList = products.reduce(
            (acc, p) => acc + (p.remainingQuantity || 0),
            0
          )
          const dbRemaining =
            (summary as any).remaining_quantity ??
            summary.remaining_stock ??
            0

          const productsRemaining =
            importsRemaining > 0
              ? importsRemaining
              : productsRemainingFromList > 0
              ? productsRemainingFromList
              : Number(dbRemaining)

          const totalProducts =
            products.length > 0
              ? products.length
              : Number(summary.total_products ?? 0)

          return {
            totalRevenue: Number(summary.total_revenue ?? 0),
            totalCost: Number(summary.total_cost ?? 0),
            grossProfit: Number(summary.gross_profit ?? 0),
            netProfit: Number(summary.net_profit ?? 0),
            totalProducts,
            productsRemaining,
            totalExpenses: Number(summary.total_expenses ?? 0),
          }
        } else {
          // If dashboard_summary view is not available, calculate from services directly
          const [sales, expenses] = await Promise.all([
            saleService.getAll().catch(() => []),
            expenseService.getAll().catch(() => []),
          ])
          const totalRevenue = sales.reduce((acc, s) => acc + s.revenue, 0)
          const totalCost = sales.reduce((acc, s) => acc + s.cost, 0)
          const grossProfit = totalRevenue - totalCost
          const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0)
          const netProfit = grossProfit - totalExpenses
          const productsRemaining = imports.reduce(
            (acc, i) => acc + (i.remainingQuantity || 0),
            0
          )

          return {
            totalRevenue,
            totalCost,
            grossProfit,
            netProfit,
            totalProducts: products.length,
            productsRemaining,
            totalExpenses,
          }
        }
      } catch (err) {
        console.warn('Supabase dashboard summary fallback to local:', err)
      }
    }

    const rawProducts = storage.getProducts()
    const rawImports = storage.getImports()
    const rawSales = storage.getSales()
    const rawExpenses = storage.getExpenses()

    const importMap = new Map(rawImports.map((i) => [i.id, i]))

    const totalRevenue = rawSales.reduce(
      (acc, s) => acc + s.quantity * s.selling_price,
      0
    )

    const totalCost = rawSales.reduce((acc, s) => {
      const imp = importMap.get(s.import_id)
      const costPrice = imp ? imp.cost_price : 0
      return acc + s.quantity * costPrice
    }, 0)

    const grossProfit = totalRevenue - totalCost
    const totalExpenses = rawExpenses.reduce((acc, e) => acc + e.amount, 0)
    const netProfit = grossProfit - totalExpenses

    const totalImported = rawImports.reduce((acc, i) => acc + i.quantity, 0)
    const totalSold = rawSales.reduce((acc, s) => acc + s.quantity, 0)
    const productsRemaining = Math.max(0, totalImported - totalSold)

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      netProfit,
      totalProducts: rawProducts.length,
      productsRemaining,
      totalExpenses,
    }
  },

  async getRevenueChartData(
    timeRange: TimeRangeFilter = 'this_month',
    customStart?: string,
    customEnd?: string
  ): Promise<RevenueChartPoint[]> {
    const [sales, expenses] = await Promise.all([
      saleService.getAll(),
      expenseService.getAll(),
    ])

    const now = new Date()
    const lastMonth = subMonths(now, 1)

    const filteredSales = sales.filter((s) => {
      const d = parseISO(s.soldDate)
      if (timeRange === 'today') return isToday(d)
      if (timeRange === 'this_week') return isThisWeek(d, { weekStartsOn: 1 })
      if (timeRange === 'this_month') return isThisMonth(d)
      if (timeRange === 'last_month') return isSameMonth(d, lastMonth)
      if (timeRange === 'custom' && customStart && customEnd) {
        return s.soldDate >= customStart && s.soldDate <= customEnd
      }
      return true
    })

    const pointsMap: {
      [key: string]: {
        label: string
        revenue: number
        cost: number
        grossProfit: number
        expenses: number
      }
    } = {}

    filteredSales.forEach((s) => {
      const key = s.soldDate.split('T')[0]
      const label = format(parseISO(s.soldDate), 'dd/MM')
      if (!pointsMap[key]) {
        pointsMap[key] = { label, revenue: 0, cost: 0, grossProfit: 0, expenses: 0 }
      }
      pointsMap[key].revenue += s.revenue
      pointsMap[key].cost += s.cost
      pointsMap[key].grossProfit += s.profit
    })

    expenses.forEach((e) => {
      const d = parseISO(e.date)
      let matches = false
      if (timeRange === 'today') matches = isToday(d)
      else if (timeRange === 'this_week') matches = isThisWeek(d, { weekStartsOn: 1 })
      else if (timeRange === 'this_month') matches = isThisMonth(d)
      else if (timeRange === 'last_month') matches = isSameMonth(d, lastMonth)
      else if (timeRange === 'custom' && customStart && customEnd) {
        matches = e.date >= customStart && e.date <= customEnd
      } else matches = true

      if (matches) {
        const key = e.date.split('T')[0]
        const label = format(parseISO(e.date), 'dd/MM')
        if (!pointsMap[key]) {
          pointsMap[key] = { label, revenue: 0, cost: 0, grossProfit: 0, expenses: 0 }
        }
        pointsMap[key].expenses += e.amount
      }
    })

    const sortedKeys = Object.keys(pointsMap).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    )

    if (sortedKeys.length === 0) {
      return [
        {
          date: format(now, 'yyyy-MM-dd'),
          label: format(now, 'dd/MM'),
          revenue: 0,
          cost: 0,
          grossProfit: 0,
          netProfit: 0,
        },
      ]
    }

    return sortedKeys.map((key) => {
      const item = pointsMap[key]
      return {
        date: key,
        label: item.label,
        revenue: item.revenue,
        cost: item.cost,
        grossProfit: item.grossProfit,
        netProfit: item.grossProfit - item.expenses,
      }
    })
  },

  async getTopSellingProducts(limit = 5): Promise<TopSellingProduct[]> {
    const sales = await saleService.getAll()
    const map = new Map<
      string,
      { productId: string; productName: string; sku: string; soldQuantity: number; revenue: number; profit: number }
    >()

    sales.forEach((s) => {
      const existing = map.get(s.productId)
      if (existing) {
        existing.soldQuantity += s.quantity
        existing.revenue += s.revenue
        existing.profit += s.profit
      } else {
        map.set(s.productId, {
          productId: s.productId,
          productName: s.productName,
          sku: s.sku,
          soldQuantity: s.quantity,
          revenue: s.revenue,
          profit: s.profit,
        })
      }
    })

    return Array.from(map.values())
      .sort((a, b) => b.soldQuantity - a.soldQuantity)
      .slice(0, limit)
  },

  async getExpensesByCategory(): Promise<ExpenseByCategory[]> {
    const expenses = await expenseService.getAll()
    const totalAmount = expenses.reduce((acc, e) => acc + e.amount, 0)
    if (totalAmount === 0) return []

    const map = new Map<string, number>()
    expenses.forEach((e) => {
      const current = map.get(e.category) || 0
      map.set(e.category, current + e.amount)
    })

    return Array.from(map.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: Number(((amount / totalAmount) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.amount - a.amount)
  },
}
