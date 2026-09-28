import { z } from 'zod'

export const importSchema = z.object({
  productId: z.string().min(1, { message: 'Vui lòng chọn sản phẩm' }),
  quantity: z
    .coerce
    .number({ invalid_type_error: 'Số lượng phải là số hợp lệ' })
    .int({ message: 'Số lượng phải là số nguyên' })
    .positive({ message: 'Số lượng nhập phải lớn hơn 0' }),
  costPrice: z
    .coerce
    .number({ invalid_type_error: 'Giá vốn phải là số hợp lệ' })
    .positive({ message: 'Giá vốn phải lớn hơn 0' }),
  importDate: z.string().min(1, { message: 'Vui lòng chọn ngày nhập' }),
})

export type ImportFormValues = z.infer<typeof importSchema>
