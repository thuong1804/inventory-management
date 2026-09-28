import { ImportRecord, ImportEntity, ImportStatus } from '@/types/import'
import { ImportFormValues } from '@/schemas/import.schema'
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

export function computeImportWithDetails(
  entity: ImportEntity,
  products = storage.getProducts(),
  sales = storage.getSales()
): ImportRecord {
  const product = products.find((p) => p.id === entity.product_id)
  const productName = product ? product.name : 'Sản phẩm không rõ'
  const sku = product ? product.sku : 'N/A'

  const batchSales = sales.filter((s) => s.import_id === entity.id)
  const soldQuantity = batchSales.reduce((acc, s) => acc + s.quantity, 0)
  const remainingQuantity = Math.max(0, entity.quantity - soldQuantity)

  let status: ImportStatus = 'available'
  if (remainingQuantity === 0) {
    status = 'sold_out'
  } else if (soldQuantity > 0) {
    status = 'partially_sold'
  }

  const totalCost = entity.quantity * entity.cost_price

  return {
    ...entity,
    productId: entity.product_id,
    productName,
    sku,
    costPrice: entity.cost_price,
    totalCost,
    importDate: entity.imported_at,
    soldQuantity,
    remainingQuantity,
    status,
    createdAt: entity.created_at,
  }
}

export async function getImports() {
  if (!isSupabaseConfigured()) {
    return importService.getAll()
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('imports')
    .select(`
      *,
      products (
        id,
        name,
        sku
      )
    `)
    .order('imported_at', { ascending: false })

  if (error) {
    console.warn('Supabase getImports error, fallback to local:', error.message)
    return importService.getAll()
  }

  return data ?? []
}

export async function createImport(input: {
  productId: string
  quantity: number
  costPrice: number
  importedAt?: string
}) {
  if (!isSupabaseConfigured()) {
    return importService.create({
      productId: input.productId,
      quantity: input.quantity,
      costPrice: input.costPrice,
      importDate: input.importedAt || new Date().toISOString(),
    })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload: {
    product_id: string
    quantity: number
    cost_price: number
    imported_at: string
    user_id?: string
  } = {
    product_id: input.productId,
    quantity: input.quantity,
    cost_price: input.costPrice,
    imported_at: input.importedAt ?? new Date().toISOString(),
  }

  if (user) {
    payload.user_id = user.id
  }

  const { data, error } = await supabase
    .from('imports')
    .insert(payload)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const importService = {
  async getAll(): Promise<ImportRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        // Query imports with products join
        const { data: rawImports, error } = await supabase
          .from('imports')
          .select(`
            *,
            products (
              id,
              name,
              sku
            )
          `)
          .order('imported_at', { ascending: false })

        if (!error && rawImports) {
          // Fetch sales to calculate remaining stock per import
          const { data: rawSales } = await supabase.from('sales').select('import_id, quantity')
          const salesMap = new Map<string, number>()
          if (rawSales) {
            rawSales.forEach((s: { import_id: string; quantity: number }) => {
              salesMap.set(s.import_id, (salesMap.get(s.import_id) || 0) + s.quantity)
            })
          }

          return rawImports.map((imp: {
            id: string
            product_id: string
            quantity: number
            cost_price: number
            imported_at: string
            created_at?: string
            products?: { id: string; name: string; sku: string }
          }) => {
            const soldQuantity = salesMap.get(imp.id) || 0
            const remainingQuantity = Math.max(0, imp.quantity - soldQuantity)
            let status: ImportStatus = 'available'
            if (remainingQuantity === 0) status = 'sold_out'
            else if (soldQuantity > 0) status = 'partially_sold'

            const productName = imp.products?.name || 'Sản phẩm'
            const sku = imp.products?.sku || 'N/A'

            return {
              id: imp.id,
              product_id: imp.product_id,
              productId: imp.product_id,
              productName,
              sku,
              quantity: imp.quantity,
              cost_price: imp.cost_price,
              costPrice: imp.cost_price,
              totalCost: imp.quantity * imp.cost_price,
              importDate: imp.imported_at,
              imported_at: imp.imported_at,
              soldQuantity,
              remainingQuantity,
              status,
              created_at: imp.created_at || imp.imported_at,
              createdAt: imp.created_at || imp.imported_at,
              updated_at: imp.created_at || imp.imported_at,
              updatedAt: imp.created_at || imp.imported_at,
            }
          })
        }
      } catch (err) {
        console.warn('Falling back to local import service:', err)
      }
    }

    const rawImports = storage.getImports()
    const products = storage.getProducts()
    const sales = storage.getSales()

    return rawImports
      .map((i) => computeImportWithDetails(i, products, sales))
      .sort(
        (a, b) => new Date(b.imported_at).getTime() - new Date(a.imported_at).getTime()
      )
  },

  async getById(id: string): Promise<ImportRecord | null> {
    const list = await this.getAll()
    return list.find((i) => i.id === id) || null
  },

  async getByProductId(productId: string): Promise<ImportRecord[]> {
    const list = await this.getAll()
    return list.filter((i) => i.productId === productId || i.product_id === productId)
  },

  async getAvailableImports(): Promise<ImportRecord[]> {
    const all = await this.getAll()
    return all.filter((i) => i.remainingQuantity > 0)
  },

  async create(data: ImportFormValues): Promise<ImportRecord> {
    if (isSupabaseConfigured()) {
      try {
        const created = await createImport({
          productId: data.productId,
          quantity: data.quantity,
          costPrice: data.costPrice,
          importedAt: data.importDate,
        })
        const items = await this.getAll()
        const found = items.find((i) => i.id === created.id)
        if (found) return found
      } catch (err) {
        console.warn('Supabase create import error, fallback to local:', err)
      }
    }

    const products = storage.getProducts()
    const product = products.find((p) => p.id === data.productId)
    if (!product) {
      throw new Error('Sản phẩm được chọn không tồn tại')
    }

    const now = new Date().toISOString()
    const importedAt = data.importDate ? new Date(data.importDate).toISOString() : now

    const newImport: ImportEntity = {
      id: `IMP-${String(Date.now()).slice(-6)}`,
      product_id: product.id,
      quantity: data.quantity,
      cost_price: data.costPrice,
      imported_at: importedAt,
      created_at: now,
      updated_at: now,
    }

    const rawImports = storage.getImports()
    storage.saveImports([newImport, ...rawImports])

    return computeImportWithDetails(newImport)
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('imports').delete().eq('id', id)
        if (error) throw new Error(error.message)
        return
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi xoá lô nhập'
        throw new Error(msg)
      }
    }

    const rawImports = storage.getImports()
    const target = rawImports.find((i) => i.id === id)
    if (!target) {
      throw new Error('Không tìm thấy phiếu nhập hàng')
    }

    const sales = storage.getSales()
    const hasSales = sales.some((s) => s.import_id === id)
    if (hasSales) {
      throw new Error(
        'Không thể xoá phiếu nhập này vì đã phát sinh đơn bán hàng từ lô này.'
      )
    }

    const updated = rawImports.filter((i) => i.id !== id)
    storage.saveImports(updated)
  },
}
