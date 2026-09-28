import { z } from 'zod'

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Tên sản phẩm phải có ít nhất 2 ký tự' })
    .max(100, { message: 'Tên sản phẩm không quá 100 ký tự' }),
  sku: z
    .string()
    .trim()
    .min(2, { message: 'Mã SKU phải có ít nhất 2 ký tự' })
    .max(30, { message: 'Mã SKU không quá 30 ký tự' })
    .regex(/^[A-Za-z0-9_-]+$/, {
      message: 'Mã SKU chỉ bao gồm chữ, số, gạch nối (-) hoặc gạch dưới (_)',
    }),
  category: z
    .string()
    .trim()
    .min(1, { message: 'Vui lòng chọn hoặc nhập danh mục' }),
})

export type ProductFormValues = z.infer<typeof productSchema>
