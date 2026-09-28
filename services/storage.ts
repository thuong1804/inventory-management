import { Category } from '@/types/category'
import { ProductEntity } from '@/types/product'
import { ImportEntity } from '@/types/import'
import { SaleEntity } from '@/types/sale'
import { ExpenseEntity } from '@/types/expense'
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_IMPORTS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
} from './mock-data'

const STORAGE_KEYS = {
  CATEGORIES: 'inventory_db_v2_categories',
  PRODUCTS: 'inventory_db_v2_products',
  IMPORTS: 'inventory_db_v2_imports',
  SALES: 'inventory_db_v2_sales',
  EXPENSES: 'inventory_db_v2_expenses',
}

const isClient = typeof window !== 'undefined'

export const storage = {
  getCategories(): Category[] {
    if (!isClient) return INITIAL_CATEGORIES
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES)
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES))
        return INITIAL_CATEGORIES
      }
      return JSON.parse(stored)
    } catch {
      return INITIAL_CATEGORIES
    }
  },

  saveCategories(categories: Category[]): void {
    if (!isClient) return
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
    window.dispatchEvent(new Event('inventory_storage_updated'))
  },

  getProducts(): ProductEntity[] {
    if (!isClient) return INITIAL_PRODUCTS
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
        return INITIAL_PRODUCTS
      }
      return JSON.parse(stored)
    } catch {
      return INITIAL_PRODUCTS
    }
  },

  saveProducts(products: ProductEntity[]): void {
    if (!isClient) return
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
    window.dispatchEvent(new Event('inventory_storage_updated'))
  },

  getImports(): ImportEntity[] {
    if (!isClient) return INITIAL_IMPORTS
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.IMPORTS)
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.IMPORTS, JSON.stringify(INITIAL_IMPORTS))
        return INITIAL_IMPORTS
      }
      return JSON.parse(stored)
    } catch {
      return INITIAL_IMPORTS
    }
  },

  saveImports(imports: ImportEntity[]): void {
    if (!isClient) return
    localStorage.setItem(STORAGE_KEYS.IMPORTS, JSON.stringify(imports))
    window.dispatchEvent(new Event('inventory_storage_updated'))
  },

  getSales(): SaleEntity[] {
    if (!isClient) return INITIAL_SALES
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SALES)
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES))
        return INITIAL_SALES
      }
      return JSON.parse(stored)
    } catch {
      return INITIAL_SALES
    }
  },

  saveSales(sales: SaleEntity[]): void {
    if (!isClient) return
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales))
    window.dispatchEvent(new Event('inventory_storage_updated'))
  },

  getExpenses(): ExpenseEntity[] {
    if (!isClient) return INITIAL_EXPENSES
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES)
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES))
        return INITIAL_EXPENSES
      }
      return JSON.parse(stored)
    } catch {
      return INITIAL_EXPENSES
    }
  },

  saveExpenses(expenses: ExpenseEntity[]): void {
    if (!isClient) return
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses))
    window.dispatchEvent(new Event('inventory_storage_updated'))
  },

  resetAll(): void {
    if (!isClient) return
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES))
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS))
    localStorage.setItem(STORAGE_KEYS.IMPORTS, JSON.stringify(INITIAL_IMPORTS))
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES))
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES))
    window.dispatchEvent(new Event('inventory_storage_updated'))
  },
}
