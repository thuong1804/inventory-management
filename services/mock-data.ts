import { Category } from '@/types/category'
import { ProductEntity } from '@/types/product'
import { ImportEntity } from '@/types/import'
import { SaleEntity } from '@/types/sale'
import { ExpenseEntity } from '@/types/expense'

/**
 * 1. Raw Mock Categories (Section 3 of DB Design)
 */
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Điện thoại & Tablet',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Máy tính & Laptop',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-3',
    name: 'Phụ kiện công nghệ',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat-4',
    name: 'Thiết bị thông minh',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

/**
 * 2. Raw Mock Products (Section 4 of DB Design)
 * Notice: NO stock_quantity or calculated metrics stored here!
 */
export const INITIAL_PRODUCTS: ProductEntity[] = [
  {
    id: 'prod-1',
    category_id: 'cat-1',
    name: 'iPhone 15 Pro Max 256GB',
    sku: 'IPHONE-15-PM',
    created_at: '2026-01-15T08:30:00Z',
    updated_at: '2026-03-20T10:15:00Z',
  },
  {
    id: 'prod-2',
    category_id: 'cat-2',
    name: 'MacBook Pro 14" M3 Pro 18GB/512GB',
    sku: 'MACBOOK-M3-PRO',
    created_at: '2026-01-18T09:00:00Z',
    updated_at: '2026-03-22T14:20:00Z',
  },
  {
    id: 'prod-3',
    category_id: 'cat-3',
    name: 'Tai nghe Sony WH-1000XM5 Noise Cancelling',
    sku: 'SONY-WH-1000XM5',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-03-24T11:45:00Z',
  },
  {
    id: 'prod-4',
    category_id: 'cat-1',
    name: 'iPad Air 11" M2 Wi-Fi 128GB',
    sku: 'IPAD-AIR-M2',
    created_at: '2026-02-10T11:20:00Z',
    updated_at: '2026-03-25T16:00:00Z',
  },
  {
    id: 'prod-5',
    category_id: 'cat-4',
    name: 'Apple Watch Series 9 GPS 45mm Nhôm',
    sku: 'AW-SERIES-9',
    created_at: '2026-02-15T13:00:00Z',
    updated_at: '2026-03-26T09:30:00Z',
  },
  {
    id: 'prod-6',
    category_id: 'cat-3',
    name: 'Chuột không dây Logitech MX Master 3S',
    sku: 'MX-MASTER-3S',
    created_at: '2026-02-20T08:00:00Z',
    updated_at: '2026-03-27T15:10:00Z',
  },
  {
    id: 'prod-7',
    category_id: 'cat-1',
    name: 'Samsung Galaxy S24 Ultra 256GB',
    sku: 'S24-ULTRA',
    created_at: '2026-02-25T14:30:00Z',
    updated_at: '2026-03-27T17:00:00Z',
  },
]

/**
 * 3. Raw Mock Imports (Section 5 of DB Design)
 * Notice: NO total_cost, sold_quantity or remaining_quantity stored here!
 */
export const INITIAL_IMPORTS: ImportEntity[] = [
  {
    id: 'IMP-001',
    product_id: 'prod-1',
    quantity: 15,
    cost_price: 26000000,
    imported_at: '2026-01-16T10:00:00Z',
    created_at: '2026-01-16T10:00:00Z',
    updated_at: '2026-01-16T10:00:00Z',
  },
  {
    id: 'IMP-002',
    product_id: 'prod-1',
    quantity: 10,
    cost_price: 26500000,
    imported_at: '2026-03-05T09:30:00Z',
    created_at: '2026-03-05T09:30:00Z',
    updated_at: '2026-03-05T09:30:00Z',
  },
  {
    id: 'IMP-003',
    product_id: 'prod-2',
    quantity: 15,
    cost_price: 42000000,
    imported_at: '2026-01-20T11:00:00Z',
    created_at: '2026-01-20T11:00:00Z',
    updated_at: '2026-01-20T11:00:00Z',
  },
  {
    id: 'IMP-004',
    product_id: 'prod-3',
    quantity: 40,
    cost_price: 5800000,
    imported_at: '2026-02-02T14:00:00Z',
    created_at: '2026-02-02T14:00:00Z',
    updated_at: '2026-02-02T14:00:00Z',
  },
  {
    id: 'IMP-005',
    product_id: 'prod-4',
    quantity: 20,
    cost_price: 13500000,
    imported_at: '2026-02-12T09:00:00Z',
    created_at: '2026-02-12T09:00:00Z',
    updated_at: '2026-02-12T09:00:00Z',
  },
  {
    id: 'IMP-006',
    product_id: 'prod-5',
    quantity: 30,
    cost_price: 8200000,
    imported_at: '2026-02-16T15:00:00Z',
    created_at: '2026-02-16T15:00:00Z',
    updated_at: '2026-02-16T15:00:00Z',
  },
  {
    id: 'IMP-007',
    product_id: 'prod-6',
    quantity: 50,
    cost_price: 1750000,
    imported_at: '2026-02-22T08:30:00Z',
    created_at: '2026-02-22T08:30:00Z',
    updated_at: '2026-02-22T08:30:00Z',
  },
  {
    id: 'IMP-008',
    product_id: 'prod-7',
    quantity: 18,
    cost_price: 24000000,
    imported_at: '2026-02-26T10:20:00Z',
    created_at: '2026-02-26T10:20:00Z',
    updated_at: '2026-02-26T10:20:00Z',
  },
]

/**
 * 4. Raw Mock Sales (Section 6 of DB Design)
 * Notice: A sale record only stores import_id, quantity, selling_price, sold_at!
 * Revenue, Cost, Profit are calculated from the parent import batch.
 */
export const INITIAL_SALES: SaleEntity[] = [
  {
    id: 'SALE-101',
    import_id: 'IMP-001',
    quantity: 5,
    selling_price: 30000000,
    sold_at: '2026-01-22T14:30:00Z',
    created_at: '2026-01-22T14:30:00Z',
    updated_at: '2026-01-22T14:30:00Z',
  },
  {
    id: 'SALE-102',
    import_id: 'IMP-001',
    quantity: 10,
    selling_price: 29800000,
    sold_at: '2026-02-10T16:00:00Z',
    created_at: '2026-02-10T16:00:00Z',
    updated_at: '2026-02-10T16:00:00Z',
  },
  {
    id: 'SALE-103',
    import_id: 'IMP-002',
    quantity: 3,
    selling_price: 30500000,
    sold_at: '2026-03-15T11:20:00Z',
    created_at: '2026-03-15T11:20:00Z',
    updated_at: '2026-03-15T11:20:00Z',
  },
  {
    id: 'SALE-104',
    import_id: 'IMP-003',
    quantity: 6,
    selling_price: 48500000,
    sold_at: '2026-02-18T10:15:00Z',
    created_at: '2026-02-18T10:15:00Z',
    updated_at: '2026-02-18T10:15:00Z',
  },
  {
    id: 'SALE-105',
    import_id: 'IMP-003',
    quantity: 5,
    selling_price: 48000000,
    sold_at: '2026-03-12T15:40:00Z',
    created_at: '2026-03-12T15:40:00Z',
    updated_at: '2026-03-12T15:40:00Z',
  },
  {
    id: 'SALE-106',
    import_id: 'IMP-004',
    quantity: 20,
    selling_price: 7200000,
    sold_at: '2026-02-25T13:00:00Z',
    created_at: '2026-02-25T13:00:00Z',
    updated_at: '2026-02-25T13:00:00Z',
  },
  {
    id: 'SALE-107',
    import_id: 'IMP-004',
    quantity: 12,
    selling_price: 7100000,
    sold_at: '2026-03-20T17:10:00Z',
    created_at: '2026-03-20T17:10:00Z',
    updated_at: '2026-03-20T17:10:00Z',
  },
  {
    id: 'SALE-108',
    import_id: 'IMP-005',
    quantity: 18,
    selling_price: 16200000,
    sold_at: '2026-03-10T14:00:00Z',
    created_at: '2026-03-10T14:00:00Z',
    updated_at: '2026-03-10T14:00:00Z',
  },
  {
    id: 'SALE-109',
    import_id: 'IMP-006',
    quantity: 30,
    selling_price: 10200000,
    sold_at: '2026-03-01T09:15:00Z',
    created_at: '2026-03-01T09:15:00Z',
    updated_at: '2026-03-01T09:15:00Z',
  },
  {
    id: 'SALE-110',
    import_id: 'IMP-007',
    quantity: 35,
    selling_price: 2450000,
    sold_at: '2026-03-18T10:45:00Z',
    created_at: '2026-03-18T10:45:00Z',
    updated_at: '2026-03-18T10:45:00Z',
  },
  {
    id: 'SALE-111',
    import_id: 'IMP-008',
    quantity: 14,
    selling_price: 28900000,
    sold_at: '2026-03-22T16:30:00Z',
    created_at: '2026-03-22T16:30:00Z',
    updated_at: '2026-03-22T16:30:00Z',
  },
]

/**
 * 5. Raw Mock Expenses (Section 7 of DB Design)
 */
export const INITIAL_EXPENSES: ExpenseEntity[] = [
  {
    id: 'EXP-01',
    name: 'Phí vận chuyển giao hàng hỏa tốc',
    category: 'Shipping',
    amount: 14500000,
    expense_date: '2026-01-25T10:00:00Z',
    description: 'Chi phí giao hàng nội thành và liên tỉnh tháng 1',
    created_at: '2026-01-25T10:00:00Z',
    updated_at: '2026-01-25T10:00:00Z',
  },
  {
    id: 'EXP-02',
    name: 'Hộp carton đóng gói cao cấp & màng co bọc',
    category: 'Packaging',
    amount: 8200000,
    expense_date: '2026-02-05T14:20:00Z',
    description: 'Nhập 1000 hộp đóng gói và bóng khí chống sốc',
    created_at: '2026-02-05T14:20:00Z',
    updated_at: '2026-02-05T14:20:00Z',
  },
  {
    id: 'EXP-03',
    name: 'Quảng cáo Meta & TikTok Ads Tết',
    category: 'Marketing',
    amount: 35000000,
    expense_date: '2026-02-15T09:00:00Z',
    description: 'Chạy chiến dịch quảng cáo mùa sắm đầu năm',
    created_at: '2026-02-15T09:00:00Z',
    updated_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 'EXP-04',
    name: 'Thuê kho bãi & vận hành tháng 2',
    category: 'Operation',
    amount: 22000000,
    expense_date: '2026-02-28T16:00:00Z',
    description: 'Tiền thuê mặt bằng kho lưu trữ và bảo vệ',
    created_at: '2026-02-28T16:00:00Z',
    updated_at: '2026-02-28T16:00:00Z',
  },
  {
    id: 'EXP-05',
    name: 'Phí vận chuyển giao hàng tháng 3',
    category: 'Shipping',
    amount: 18200000,
    expense_date: '2026-03-10T11:30:00Z',
    description: 'Đối soát ship Viettel Post & GHN',
    created_at: '2026-03-10T11:30:00Z',
    updated_at: '2026-03-10T11:30:00Z',
  },
  {
    id: 'EXP-06',
    name: 'Dịch vụ lưu trữ máy chủ & phần mềm',
    category: 'Other',
    amount: 6500000,
    expense_date: '2026-03-15T15:00:00Z',
    description: 'Gia hạn phần mềm kế toán và server hosting',
    created_at: '2026-03-15T15:00:00Z',
    updated_at: '2026-03-15T15:00:00Z',
  },
  {
    id: 'EXP-07',
    name: 'Chiến dịch Kol Review & Livestream',
    category: 'Marketing',
    amount: 25000000,
    expense_date: '2026-03-20T17:30:00Z',
    description: 'Booking reviewer công nghệ trải nghiệm sản phẩm',
    created_at: '2026-03-20T17:30:00Z',
    updated_at: '2026-03-20T17:30:00Z',
  },
]
