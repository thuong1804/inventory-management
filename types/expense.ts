export type ExpenseCategory =
  | 'Shipping'
  | 'Packaging'
  | 'Marketing'
  | 'Operation'
  | 'Other'

/**
 * Raw Database Entity: `expenses` table
 * As defined in Section 7 of Database Design
 */
export interface ExpenseEntity {
  id: string
  name: string
  category: ExpenseCategory
  amount: number
  expense_date: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ExpenseRecord extends ExpenseEntity {
  date: string // alias to expense_date for UI components
  createdAt: string
}

export interface ExpenseFormData {
  name: string
  category: ExpenseCategory
  amount: number
  date: string
  description?: string
}
