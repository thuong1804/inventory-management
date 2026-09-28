'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  expenseSchema,
  ExpenseFormValues,
  expenseCategories,
} from '@/schemas/expense.schema'
import { ExpenseCategory } from '@/types/expense'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toInputDate, formatVND } from '@/lib/formatters'
import { Loader2Icon } from 'lucide-react'

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormValues>
  onSubmit: (data: ExpenseFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  Shipping: 'Vận chuyển (Shipping)',
  Packaging: 'Bao bì & Đóng gói (Packaging)',
  Marketing: 'Marketing & Quảng cáo',
  Operation: 'Vận hành kho bãi (Operation)',
  Other: 'Chi phí khác (Other)',
}

export function ExpenseForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      category: defaultValues?.category || 'Shipping',
      amount: defaultValues?.amount || 0,
      date: defaultValues?.date || toInputDate(),
      description: defaultValues?.description || '',
    },
  })

  const currentCategory = watch('category')
  const currentAmount = watch('amount')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Expense Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-semibold">
          Tên chi phí <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Ví dụ: Phí vận chuyển giao hàng đợt 1"
          {...register('name')}
          disabled={isSubmitting}
          className="h-9 text-sm"
        />
        {errors.name && (
          <p className="text-[11px] text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs font-semibold">
            Danh mục chi phí <span className="text-destructive">*</span>
          </Label>
          <select
            id="category"
            value={currentCategory}
            onChange={(e) => setValue('category', e.target.value as ExpenseCategory)}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-card"
          >
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-popover text-popover-foreground">
                {CATEGORY_LABELS[cat] || cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[11px] text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-xs font-semibold">
            Số tiền chi (VND) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            min={1000}
            step={1000}
            placeholder="1500000"
            {...register('amount', { valueAsNumber: true })}
            disabled={isSubmitting}
            className="h-9 text-sm font-mono"
          />
          {errors.amount && (
            <p className="text-[11px] text-destructive">{errors.amount.message}</p>
          )}
        </div>
      </div>

      {Number(currentAmount) > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5 text-xs border border-border/60">
          <span className="text-muted-foreground">Số tiền bằng chữ số:</span>
          <span className="font-mono font-bold text-foreground">
            {formatVND(Number(currentAmount))}
          </span>
        </div>
      )}

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="date" className="text-xs font-semibold">
          Ngày phát sinh chi phí <span className="text-destructive">*</span>
        </Label>
        <Input
          id="date"
          type="date"
          {...register('date')}
          disabled={isSubmitting}
          className="h-9 text-sm"
        />
        {errors.date && (
          <p className="text-[11px] text-destructive">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-semibold">
          Ghi chú chi tiết (Tùy chọn)
        </Label>
        <Textarea
          id="description"
          placeholder="Mô tả hóa đơn, đơn vị nhận thanh toán hoặc mục đích chi tiêu..."
          rows={3}
          {...register('description')}
          disabled={isSubmitting}
          className="text-xs"
        />
        {errors.description && (
          <p className="text-[11px] text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          size="sm"
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting} size="sm">
          {isSubmitting && <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />}
          {defaultValues?.name ? 'Lưu cập nhật' : 'Ghi nhận chi phí'}
        </Button>
      </div>
    </form>
  )
}
