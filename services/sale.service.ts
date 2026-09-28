import { SaleRecord, SaleEntity } from '@/types/sale'
import { SaleFormValues } from '@/schemas/sale.schema'
import { SalesDetail } from '@/types/database'
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

export function computeSaleWithDetails(
  sale: SaleEntity,
  imports = storage.getImports(),
  products = storage.getProducts()
): SaleRecord {
  const importItem = imports.find((i) => i.id === sale.import_id)
  const product = importItem
    ? products.find((p) => p.id === importItem.product_id)
    : null

  const costPrice = importItem ? importItem.cost_price : 0
  const productName = product ? product.name : 'Sản phẩm'
  const sku = product ? product.sku : 'N/A'
  const productId = product ? product.id : ''

  const revenue = sale.quantity * sale.selling_price
  const cost = sale.quantity * costPrice
  const profit = revenue - cost

  return {
    ...sale,
    importId: sale.import_id,
    productId,
    productName,
    sku,
    costPrice,
    sellingPrice: sale.selling_price,
    revenue,
    cost,
    profit,
    soldDate: sale.sold_at,
    createdAt: sale.created_at,
    buyerName: sale.buyer_name ?? null,
    buyerPhone: sale.buyer_phone ?? null,
    buyerAddress: sale.buyer_address ?? null,
  }
}

export async function getSales(): Promise<SalesDetail[]> {
  if (!isSupabaseConfigured()) {
    const local = await saleService.getAll()
    return local.map((s) => ({
      id: s.id,
      import_id: s.importId,
      user_id: '',
      product_id: s.productId,
      sku: s.sku,
      product_name: s.productName,
      quantity: s.quantity,
      cost_price: s.costPrice,
      selling_price: s.sellingPrice,
      buyer_name: s.buyerName ?? null,
      buyer_phone: s.buyerPhone ?? null,
      buyer_address: s.buyerAddress ?? null,
      total_cost: s.cost,
      revenue: s.revenue,
      gross_profit: s.profit,
      sold_at: s.soldDate,
      created_at: s.createdAt,
      updated_at: s.createdAt,
    }))
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('sales_detail')
    .select('*')
    .order('sold_at', { ascending: false })

  if (error) {
    console.warn('Supabase getSales error, falling back to local:', error.message)
    const local = await saleService.getAll()
    return local.map((s) => ({
      id: s.id,
      import_id: s.importId,
      user_id: '',
      product_id: s.productId,
      sku: s.sku,
      product_name: s.productName,
      quantity: s.quantity,
      cost_price: s.costPrice,
      selling_price: s.sellingPrice,
      buyer_name: s.buyerName ?? null,
      buyer_phone: s.buyerPhone ?? null,
      buyer_address: s.buyerAddress ?? null,
      total_cost: s.cost,
      revenue: s.revenue,
      gross_profit: s.profit,
      sold_at: s.soldDate,
      created_at: s.createdAt,
      updated_at: s.createdAt,
    }))
  }

  return (data as SalesDetail[]) ?? []
}

/**
 * Creates a sale using the mandatory create_sale() RPC in PostgreSQL (Section 14)
 */
export async function createSale(input: {
  importId: string
  quantity: number
  sellingPrice: number
  soldAt?: string
  buyerName?: string
  buyerPhone?: string
  buyerAddress?: string
}) {
  if (!isSupabaseConfigured()) {
    return saleService.create({
      importId: input.importId,
      quantity: input.quantity,
      sellingPrice: input.sellingPrice,
      soldDate: input.soldAt || new Date().toISOString(),
      buyerName: input.buyerName,
      buyerPhone: input.buyerPhone,
      buyerAddress: input.buyerAddress,
    })
  }

  const supabase = createClient()
  const { data, error } = await supabase.rpc('create_sale', {
    p_import_id: input.importId,
    p_quantity: input.quantity,
    p_selling_price: input.sellingPrice,
    p_sold_at: input.soldAt ?? new Date().toISOString(),
    p_buyer_name: input.buyerName || null,
    p_buyer_phone: input.buyerPhone || null,
    p_buyer_address: input.buyerAddress || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const saleService = {
  async getAll(): Promise<SaleRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        // Query view sales_detail
        const { data, error } = await supabase
          .from('sales_detail')
          .select('*')
          .order('sold_at', { ascending: false })

        if (!error && data) {
          return data.map((s: SalesDetail & { created_at?: string }) => ({
            id: s.id,
            import_id: s.import_id,
            importId: s.import_id,
            productId: s.product_id,
            productName: s.product_name,
            sku: s.sku,
            quantity: s.quantity,
            cost_price: s.cost_price,
            costPrice: s.cost_price,
            selling_price: s.selling_price,
            sellingPrice: s.selling_price,
            buyer_name: s.buyer_name ?? null,
            buyer_phone: s.buyer_phone ?? null,
            buyer_address: s.buyer_address ?? null,
            buyerName: s.buyer_name ?? null,
            buyerPhone: s.buyer_phone ?? null,
            buyerAddress: s.buyer_address ?? null,
            revenue: s.revenue,
            cost: s.total_cost,
            profit: s.gross_profit,
            sold_at: s.sold_at,
            soldDate: s.sold_at,
            created_at: s.created_at || s.sold_at,
            createdAt: s.created_at || s.sold_at,
            updated_at: s.created_at || s.sold_at,
            updatedAt: s.created_at || s.sold_at,
          }))
        }
      } catch (err) {
        console.warn('Falling back to local sale service:', err)
      }
    }

    const rawSales = storage.getSales()
    const imports = storage.getImports()
    const products = storage.getProducts()

    return rawSales
      .map((s) => computeSaleWithDetails(s, imports, products))
      .sort(
        (a, b) => new Date(b.sold_at).getTime() - new Date(a.sold_at).getTime()
      )
  },

  async getById(id: string): Promise<SaleRecord | null> {
    const list = await this.getAll()
    return list.find((s) => s.id === id) || null
  },

  async getByProductId(productId: string): Promise<SaleRecord[]> {
    const all = await this.getAll()
    return all.filter((s) => s.productId === productId)
  },

  async create(data: SaleFormValues): Promise<SaleRecord> {
    if (isSupabaseConfigured()) {
      try {
        const rpcResult = await createSale({
          importId: data.importId,
          quantity: data.quantity,
          sellingPrice: data.sellingPrice,
          soldAt: data.soldDate,
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          buyerAddress: data.buyerAddress,
        })
        const all = await this.getAll()
        const found = all.find((s) => s.id === rpcResult?.id || s.id === rpcResult)
        if (found) return found
        if (all.length > 0) return all[0]
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi tạo đơn bán'
        throw new Error(msg)
      }
    }

    const imports = storage.getImports()
    const importItem = imports.find((i) => i.id === data.importId)

    if (!importItem) {
      throw new Error('Lô hàng nhập không tồn tại')
    }

    const existingSales = storage.getSales().filter((s) => s.import_id === data.importId)
    const alreadySold = existingSales.reduce((acc, s) => acc + s.quantity, 0)
    const remainingQuantity = Math.max(0, importItem.quantity - alreadySold)

    if (data.quantity > remainingQuantity) {
      throw new Error(
        `Không thể bán nhiều hơn số lượng tồn kho của lô hàng. Hiện còn: ${remainingQuantity} chiếc`
      )
    }

    const now = new Date().toISOString()
    const soldAt = data.soldDate ? new Date(data.soldDate).toISOString() : now

    const newSale: SaleEntity = {
      id: `SALE-${String(Date.now()).slice(-6)}`,
      import_id: importItem.id,
      quantity: data.quantity,
      selling_price: data.sellingPrice,
      buyer_name: data.buyerName || null,
      buyer_phone: data.buyerPhone || null,
      buyer_address: data.buyerAddress || null,
      sold_at: soldAt,
      created_at: now,
      updated_at: now,
    }

    const rawSales = storage.getSales()
    storage.saveSales([newSale, ...rawSales])

    return computeSaleWithDetails(newSale)
  },

  async delete(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient()
        const { error } = await supabase.from('sales').delete().eq('id', id)
        if (error) throw new Error(error.message)
        return
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi xoá đơn bán'
        throw new Error(msg)
      }
    }

    const rawSales = storage.getSales()
    const exists = rawSales.some((s) => s.id === id)
    if (!exists) {
      throw new Error('Không tìm thấy bản ghi bán hàng')
    }

    const updated = rawSales.filter((s) => s.id !== id)
    storage.saveSales(updated)
  },
}
