import { z } from 'zod'

export const saleSchema = z.object({
  importId: z.string().min(1, { message: 'Vui lòng chọn lô hàng nhập' }),
  quantity: z
    .coerce
    .number({ invalid_type_error: 'Số lượng phải là số hợp lệ' })
    .int({ message: 'Số lượng phải là số nguyên' })
    .positive({ message: 'Số lượng bán phải lớn hơn 0' }),
  sellingPrice: z
    .coerce
    .number({ invalid_type_error: 'Giá bán phải là số hợp lệ' })
    .positive({ message: 'Giá bán phải lớn hơn 0' }),
  soldDate: z.string().min(1, { message: 'Vui lòng chọn ngày bán' }),
  buyerName: z.string().optional(),
  buyerPhone: z.string().optional(),
  buyerAddress: z.string().optional(),
})

export type SaleFormValues = z.infer<typeof saleSchema>
