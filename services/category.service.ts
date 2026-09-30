import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types/category'
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

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return storage.getCategories()
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  if (error) {
    console.warn('Supabase getCategories error, falling back to local storage:', error.message)
    return storage.getCategories()
  }

  const raw = (data as Category[]) ?? []
  const seen = new Set<string>()
  const uniqueCategories: Category[] = []

  for (const cat of raw) {
    const key = cat.name.trim().toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      uniqueCategories.push(cat)
    }
  }

  return uniqueCategories
}

export async function createCategory(name: string): Promise<Category> {
  const trimmed = name.trim()
  if (!isSupabaseConfigured()) {
    return categoryService.createMock(trimmed)
  }

  const supabase = createClient()

  // Check if a category with this name already exists in Supabase
  const { data: existingList } = await supabase
    .from('categories')
    .select('*')
    .ilike('name', trimmed)
    .limit(1)

  if (existingList && existingList.length > 0) {
    return existingList[0] as Category
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload: { name: string; user_id?: string } = { name: trimmed }
  if (user) {
    payload.user_id = user.id
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.warn('Supabase createCategory error, using local fallback:', error.message)
    return categoryService.createMock(trimmed)
  }

  return data as Category
}

export const categoryService = {
  getAll: getCategories,
  getById: async (id: string): Promise<Category | null> => {
    const list = await getCategories()
    return list.find((c) => c.id === id) || null
  },
  create: createCategory,
  createMock: async (name: string): Promise<Category> => {
    const trimmed = name.trim()
    const categories = storage.getCategories()
    const exists = categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) return exists

    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: trimmed,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    storage.saveCategories([...categories, newCategory])
    return newCategory
  },
}
