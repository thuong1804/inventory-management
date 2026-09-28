import { ExpenseRecord, ExpenseEntity, ExpenseCategory } from '@/types/expense'
import { ExpenseFormValues } from '@/schemas/expense.schema'
import { createClient } from '@/lib/supabase/client'
import { storage } from './storage'

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

function mapExpenseRecord(entity: ExpenseEntity): ExpenseRecord {
  return {
    ...entity,
    date: entity.expense_date,
    createdAt: entity.created_at,
  }
}

export async function getExpenses() {
  if (!isSupabaseConfigured()) {
    return expenseService.getAll()
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('expense_date', { ascending: false })

  if (error) {
    console.warn('Supabase getExpenses error, falling back:', error.message)
    return expenseService.getAll()
  }

  return data ?? []
}

export async function createExpense(input: {
  name: string
  category: string
  amount: number
  expenseDate?: string
  description?: string
}) {
  if (!isSupabaseConfigured()) {
    return expenseService.create({
      name: input.name,
      category: input.category as ExpenseCategory,
      amount: input.amount,
      date: input.expenseDate || new Date().toISOString(),
      description: input.description ?? '',
    })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload: {
    name: string
    category: string
    amount: number
    expense_date: string
    description: string | null
    user_id?: string
  } = {
    name: input.name,
    category: input.category,
    amount: input.amount,
    expense_date: input.expenseDate ?? new Date().toISOString(),
    description: input.description ?? null,
  }

  if (user) {
    payload.user_id = user.id
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const expenseService = {
  async getAll(): Promise<ExpenseRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('expense_date', { ascending: false })

        if (!error && data) {
          return data.map((e: ExpenseEntity) => mapExpenseRecord(e))
        }
      } catch (err) {
        console.warn('Falling back to local expense service:', err)
      }
    }

    const rawExpenses = storage.getExpenses()
    return rawExpenses
      .map(mapExpenseRecord)
      .sort(
        (a, b) =>
          new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
      )
  },

  async getById(id: string): Promise<ExpenseRecord | null> {
    const list = await this.getAll()
    return list.find((e) => e.id === id) || null
  },

  async create(data: ExpenseFormValues): Promise<ExpenseRecord> {
    if (isSupabaseConfigured()) {
      try {
        const created = await createExpense({
          name: data.name,
          category: data.category,
          amount: data.amount,
          expenseDate: data.date,
          description: data.description,
        })
        return mapExpenseRecord(created as ExpenseEntity)
      } catch (err) {
        console.warn('Supabase create expense error, fallback to local:', err)
      }
    }

    const now = new Date().toISOString()
    const expenseDate = data.date ? new Date(data.date).toISOString() : now

    const newExpense: ExpenseEntity = {
      id: `EXP-${String(Date.now()).slice(-5)}`,
      name: data.name.trim(),
      category: data.category as ExpenseCategory,
      amount: data.amount,
      expense_date: expenseDate,
      description: data.description?.trim() || '',
      created_at: now,
      updated_at: now,
    }

    const rawExpenses = storage.getExpenses()
    storage.saveExpenses([newExpense, ...rawExpenses])
    return mapExpenseRecord(newExpense)
  },

  async update(id: string, data: ExpenseFormValues): Promise<ExpenseRecord> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        const { data: updated, error } = await supabase
          .from('expenses')
          .update({
            name: data.name.trim(),
            category: data.category as ExpenseCategory,
            amount: data.amount,
            expense_date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            description: data.description?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single()

        if (!error && updated) {
          return mapExpenseRecord(updated as ExpenseEntity)
        }
      } catch (err) {
        console.warn('Supabase update expense error, fallback to local:', err)
      }
    }

    const rawExpenses = storage.getExpenses()
    const index = rawExpenses.findIndex((e) => e.id === id)
    if (index === -1) {
      throw new Error('Không tìm thấy khoản chi phí')
    }

    const expenseDate = data.date ? new Date(data.date).toISOString() : rawExpenses[index].expense_date

    const updated: ExpenseEntity = {
      ...rawExpenses[index],
      name: data.name.trim(),
      category: data.category as ExpenseCategory,
      amount: data.amount,
      expense_date: expenseDate,
      description: data.description?.trim() || '',
      updated_at: new Date().toISOString(),
    }

    rawExpenses[index] = updated
    storage.saveExpenses(rawExpenses)
    return mapExpenseRecord(updated)
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('expenses').delete().eq('id', id)
        if (error) throw new Error(error.message)
        return
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi xoá chi phí'
        throw new Error(msg)
      }
    }

    const rawExpenses = storage.getExpenses()
    const updated = rawExpenses.filter((e) => e.id !== id)
    storage.saveExpenses(updated)
  },
}
