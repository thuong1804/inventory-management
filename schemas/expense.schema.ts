import { z } from 'zod'

export const expenseCategories = [
  'Shipping',
  'Packaging',
  'Marketing',
  'Operation',
  'Other',
] as const

export const expenseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Tên chi phí phải có ít nhất 2 ký tự' })
    .max(100, { message: 'Tên chi phí không quá 100 ký tự' }),
  category: z.enum(expenseCategories, {
    errorMap: () => ({ message: 'Vui lòng chọn danh mục hợp lệ' }),
  }),
  amount: z
    .coerce
    .number({ invalid_type_error: 'Số tiền phải là số hợp lệ' })
    .positive({ message: 'Số tiền chi phí phải lớn hơn 0' }),
  date: z.string().min(1, { message: 'Vui lòng chọn ngày chi' }),
  description: z.string().max(255, { message: 'Ghi chú tối đa 255 ký tự' }).optional().or(z.literal('')),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
