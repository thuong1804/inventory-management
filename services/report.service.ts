import { productService } from './product.service'
import { importService } from './import.service'
import { saleService } from './sale.service'
import { expenseService } from './expense.service'
import { parseISO, format } from 'date-fns'

export interface DayReportItem {
  date: string
  revenue: number
  cost: number
  profit: number
  ordersCount: number
}

export interface MonthReportItem {
  month: string
  revenue: number
  cost: number
  profit: number
  expenses: number
  netProfit: number
}

export interface ProductReportItem {
  productId: string
  productName: string
  sku: string
  category: string
  importedQty: number
  soldQty: number
  remainingQty: number
  revenue: number
  cost: number
  profit: number
}

export interface InventoryValuationItem {
  productId: string
  productName: string
  sku: string
  remainingQuantity: number
  estimatedValue: number
}

export interface ReportSummary {
  revenueReport: {
    byDay: DayReportItem[]
    byMonth: MonthReportItem[]
    byProduct: ProductReportItem[]
  }
  costReport: {
    totalCost: number
    costByProduct: { productName: string; sku: string; cost: number }[]
    costByMonth: { month: string; cost: number }[]
  }
  profitReport: {
    totalRevenue: number
    totalCost: number
    grossProfit: number
    totalExpenses: number
    netProfit: number
  }
  inventoryReport: {
    totalImported: number
    totalSold: number
    remainingQuantity: number
    totalInventoryValue: number
    items: InventoryValuationItem[]
  }
}

export const reportService = {
  async getFullReports(): Promise<ReportSummary> {
    const [products, imports, sales, expenses] = await Promise.all([
      productService.getAll(),
      importService.getAll(),
      saleService.getAll(),
      expenseService.getAll(),
    ])

    // 1. Day report
    const dayMap = new Map<string, DayReportItem>()
    sales.forEach((s) => {
      const existing = dayMap.get(s.soldDate) || {
        date: s.soldDate,
        revenue: 0,
        cost: 0,
        profit: 0,
        ordersCount: 0,
      }
      existing.revenue += s.revenue
      existing.cost += s.cost
      existing.profit += s.profit
      existing.ordersCount += 1
      dayMap.set(s.soldDate, existing)
    })
    const byDay = Array.from(dayMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    // 2. Month report
    const monthMap = new Map<string, MonthReportItem>()
    sales.forEach((s) => {
      const monthKey = format(parseISO(s.soldDate), 'yyyy-MM')
      const existing = monthMap.get(monthKey) || {
        month: monthKey,
        revenue: 0,
        cost: 0,
        profit: 0,
        expenses: 0,
        netProfit: 0,
      }
      existing.revenue += s.revenue
      existing.cost += s.cost
      existing.profit += s.profit
      monthMap.set(monthKey, existing)
    })
    expenses.forEach((e) => {
      const monthKey = format(parseISO(e.date), 'yyyy-MM')
      const existing = monthMap.get(monthKey) || {
        month: monthKey,
        revenue: 0,
        cost: 0,
        profit: 0,
        expenses: 0,
        netProfit: 0,
      }
      existing.expenses += e.amount
      monthMap.set(monthKey, existing)
    })
    const byMonth = Array.from(monthMap.values())
      .map((m) => ({
        ...m,
        netProfit: m.profit - m.expenses,
      }))
      .sort((a, b) => b.month.localeCompare(a.month))

    // 3. Product report
    const byProduct: ProductReportItem[] = products.map((p) => {
      const pSales = sales.filter((s) => s.productId === p.id)
      const pImports = imports.filter((i) => i.productId === p.id)
      const revenue = pSales.reduce((acc, s) => acc + s.revenue, 0)
      const cost = pSales.reduce((acc, s) => acc + s.cost, 0)
      const profit = revenue - cost
      const importedQty = pImports.reduce((acc, i) => acc + i.quantity, 0)
      const soldQty = pSales.reduce((acc, s) => acc + s.quantity, 0)

      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        category: p.category,
        importedQty,
        soldQty,
        remainingQty: p.remainingQuantity,
        revenue,
        cost,
        profit,
      }
    })

    // 4. Cost report
    const totalCost = sales.reduce((acc, s) => acc + s.cost, 0)
    const costByProduct = byProduct
      .map((p) => ({
        productName: p.productName,
        sku: p.sku,
        cost: p.cost,
      }))
      .filter((p) => p.cost > 0)
      .sort((a, b) => b.cost - a.cost)

    const costByMonth = byMonth.map((m) => ({
      month: m.month,
      cost: m.cost,
    }))

    // 5. Profit report
    const totalRevenue = sales.reduce((acc, s) => acc + s.revenue, 0)
    const grossProfit = totalRevenue - totalCost
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0)
    const netProfit = grossProfit - totalExpenses

    // 6. Inventory Valuation
    // Value of remaining stock = remaining quantity * import costPrice from active batches
    let totalInventoryValue = 0
    const inventoryItems: InventoryValuationItem[] = products.map((p) => {
      const pImports = imports.filter((i) => i.productId === p.id)
      const pRemainingValue = pImports.reduce(
        (acc, imp) => acc + imp.remainingQuantity * imp.costPrice,
        0
      )
      totalInventoryValue += pRemainingValue
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        remainingQuantity: p.remainingQuantity,
        estimatedValue: pRemainingValue,
      }
    })

    const totalImported = products.reduce((acc, p) => acc + p.totalImported, 0)
    const totalSold = products.reduce((acc, p) => acc + p.totalSold, 0)
    const totalRemaining = products.reduce((acc, p) => acc + p.remainingQuantity, 0)

    return {
      revenueReport: {
        byDay,
        byMonth,
        byProduct,
      },
      costReport: {
        totalCost,
        costByProduct,
        costByMonth,
      },
      profitReport: {
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        netProfit,
      },
      inventoryReport: {
        totalImported,
        totalSold,
        remainingQuantity: totalRemaining,
        totalInventoryValue,
        items: inventoryItems,
      },
    }
  },
}
