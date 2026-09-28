import { Product, ProductEntity, ProductFilter, StockStatus } from '@/types/product'
import { ProductFormValues } from '@/schemas/product.schema'
import { ProductInventory } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { storage } from './storage'
import { categoryService } from './category.service'

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

function getStockStatus(remaining: number): StockStatus {
  if (remaining <= 0) return 'out_of_stock'
  if (remaining <= 5) return 'low_stock'
  return 'in_stock'
}

export function computeProductWithStock(
  entity: ProductEntity,
  categories = storage.getCategories(),
  imports = storage.getImports(),
  sales = storage.getSales()
): Product {
  const category = categories.find((c) => c.id === entity.category_id)
  const categoryName = category ? category.name : 'Khác'

  const productImports = imports.filter((i) => i.product_id === entity.id)
  const totalImported = productImports.reduce((acc, i) => acc + i.quantity, 0)

  const productImportIds = new Set(productImports.map((i) => i.id))
  const productSales = sales.filter((s) => productImportIds.has(s.import_id))
  const totalSold = productSales.reduce((acc, s) => acc + s.quantity, 0)

  const remainingQuantity = Math.max(0, totalImported - totalSold)

  return {
    ...entity,
    category: categoryName,
    categoryName,
    totalImported,
    totalSold,
    remainingQuantity,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  }
}

export async function getProducts(): Promise<ProductInventory[]> {
  if (!isSupabaseConfigured()) {
    const local = await productService.getAll()
    return local.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category_name: p.categoryName,
      total_imported: p.totalImported,
      total_sold: p.totalSold,
      remaining_quantity: p.remainingQuantity,
    }))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_inventory')
    .select('*')
    .order('sku')

  if (error) {
    console.warn('Supabase getProducts error, falling back:', error.message)
    const local = await productService.getAll()
    return local.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category_name: p.categoryName,
      total_imported: p.totalImported,
      total_sold: p.totalSold,
      remaining_quantity: p.remainingQuantity,
    }))
  }

  return (data as ProductInventory[]) ?? []
}

export async function createProduct(input: {
  name: string
  sku: string
  categoryId: string
}) {
  if (!isSupabaseConfigured()) {
    return productService.create({
      name: input.name,
      sku: input.sku,
      category: input.categoryId,
    })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload: {
    name: string
    sku: string
    category_id: string
    user_id?: string
  } = {
    name: input.name.trim(),
    sku: input.sku.trim().toUpperCase(),
    category_id: input.categoryId,
  }

  if (user) {
    payload.user_id = user.id
  }

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateProduct(
  id: string,
  input: {
    name: string
    sku: string
    categoryId: string
  }
) {
  if (!isSupabaseConfigured()) {
    return productService.update(id, {
      name: input.name,
      sku: input.sku,
      category: input.categoryId,
    })
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .update({
      name: input.name.trim(),
      sku: input.sku.trim().toUpperCase(),
      category_id: input.categoryId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteProduct(id: string) {
  if (!isSupabaseConfigured()) {
    return productService.delete(id)
  }

  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'Không thể xoá sản phẩm này vì đang có dữ liệu nhập/xuất liên quan. Vui lòng xoá các phiếu nhập/xuất của sản phẩm trước.'
      )
    }
    throw new Error(error.message)
  }
}

export const productService = {
  async getAll(filters?: ProductFilter): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        // Query view product_inventory or join products with category
        const { data, error } = await supabase
          .from('product_inventory')
          .select('*')

        if (!error && data) {
          let items: Product[] = data.map((row: ProductInventory & { category_id?: string; created_at?: string; updated_at?: string }) => ({
            id: row.id,
            name: row.name,
            sku: row.sku,
            category_id: row.category_id || '',
            category: row.category_name,
            categoryName: row.category_name,
            totalImported: row.total_imported ?? 0,
            totalSold: row.total_sold ?? 0,
            remainingQuantity: row.remaining_quantity ?? 0,
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at || new Date().toISOString(),
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          }))

          if (filters?.search) {
            const q = filters.search.toLowerCase().trim()
            items = items.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.sku.toLowerCase().includes(q) ||
                p.categoryName.toLowerCase().includes(q)
            )
          }

          if (filters?.categoryId && filters.categoryId !== 'all') {
            items = items.filter((p) => p.category_id === filters.categoryId)
          } else if (filters?.category && filters.category !== 'all') {
            items = items.filter((p) => p.categoryName === filters.category)
          }

          if (filters?.stockStatus && filters.stockStatus !== 'all') {
            items = items.filter(
              (p) => getStockStatus(p.remainingQuantity) === filters.stockStatus
            )
          }

          return items
        }
      } catch (err) {
        console.warn('Falling back to local product service:', err)
      }
    }

    const rawProducts = storage.getProducts()
    const categories = storage.getCategories()
    const imports = storage.getImports()
    const sales = storage.getSales()

    let items = rawProducts.map((p) =>
      computeProductWithStock(p, categories, imports, sales)
    )

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim()
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      )
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
      items = items.filter((p) => p.category_id === filters.categoryId)
    } else if (filters?.category && filters.category !== 'all') {
      items = items.filter((p) => p.categoryName === filters.category)
    }

    if (filters?.stockStatus && filters.stockStatus !== 'all') {
      items = items.filter(
        (p) => getStockStatus(p.remainingQuantity) === filters.stockStatus
      )
    }

    return items
  },

  async getById(id: string): Promise<Product | null> {
    const list = await this.getAll()
    return list.find((p) => p.id === id) || null
  },

  async create(data: ProductFormValues): Promise<Product> {
    // Find or create category
    const category = await categoryService.create(data.category)

    if (isSupabaseConfigured()) {
      try {
        await createProduct({
          name: data.name,
          sku: data.sku,
          categoryId: category.id,
        })
        const items = await this.getAll()
        const found = items.find((p) => p.sku.toUpperCase() === data.sku.trim().toUpperCase())
        if (found) return found
      } catch (err) {
        console.warn('Supabase create product error, fallback to local:', err)
      }
    }

    const rawProducts = storage.getProducts()
    const exists = rawProducts.some(
      (p) => p.sku.toLowerCase() === data.sku.trim().toLowerCase()
    )
    if (exists) {
      throw new Error(`Mã SKU "${data.sku}" đã tồn tại. Vui lòng chọn mã khác.`)
    }

    const now = new Date().toISOString()
    const newProduct: ProductEntity = {
      id: `prod-${Date.now()}`,
      category_id: category.id,
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      created_at: now,
      updated_at: now,
    }

    storage.saveProducts([newProduct, ...rawProducts])
    return computeProductWithStock(newProduct)
  },

  async update(id: string, data: ProductFormValues): Promise<Product> {
    const category = await categoryService.create(data.category)

    if (isSupabaseConfigured()) {
      try {
        await updateProduct(id, {
          name: data.name,
          sku: data.sku,
          categoryId: category.id,
        })
        const found = await this.getById(id)
        if (found) return found
      } catch (err) {
        console.warn('Supabase update product error, fallback to local:', err)
      }
    }

    const rawProducts = storage.getProducts()
    const index = rawProducts.findIndex((p) => p.id === id)
    if (index === -1) {
      throw new Error('Không tìm thấy sản phẩm')
    }

    const exists = rawProducts.some(
      (p) => p.id !== id && p.sku.toLowerCase() === data.sku.trim().toLowerCase()
    )
    if (exists) {
      throw new Error(`Mã SKU "${data.sku}" đã được sử dụng bởi sản phẩm khác.`)
    }

    const updatedProduct: ProductEntity = {
      ...rawProducts[index],
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      category_id: category.id,
      updated_at: new Date().toISOString(),
    }

    rawProducts[index] = updatedProduct
    storage.saveProducts(rawProducts)
    return computeProductWithStock(updatedProduct)
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await deleteProduct(id)
      return
    }

    const imports = storage.getImports().filter((i) => i.product_id === id)
    if (imports.length > 0) {
      throw new Error(
        'Không thể xoá sản phẩm đã có lịch sử nhập hàng. Vui lòng xoá các phiếu nhập trước.'
      )
    }

    const rawProducts = storage.getProducts()
    const updated = rawProducts.filter((p) => p.id !== id)
    storage.saveProducts(updated)
  },

  async getCategories(): Promise<string[]> {
    const categories = await categoryService.getAll()
    return categories.map((c) => c.name)
  },
}
