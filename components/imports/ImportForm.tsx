'use client'

import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { importSchema, ImportFormValues } from '@/schemas/import.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Product } from '@/types/product'
import { formatVND, toInputDate } from '@/lib/formatters'
import { Loader2Icon, CalculatorIcon } from 'lucide-react'

interface ImportFormProps {
  products: Product[]
  onSubmit: (data: ImportFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function ImportForm({
  products,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ImportFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      productId: products[0]?.id || '',
      quantity: 1,
      costPrice: 0,
      importDate: toInputDate(),
    },
  })

  const watchQuantity = watch('quantity')
  const watchCostPrice = watch('costPrice')
  const selectedProductId = watch('productId')

  const totalCost = useMemo(() => {
    const q = Number(watchQuantity) || 0
    const p = Number(watchCostPrice) || 0
    return q * p
  }, [watchQuantity, watchCostPrice])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Product Select */}
      <div className="space-y-1.5">
        <Label htmlFor="productId" className="text-xs font-semibold">
          Chọn Sản phẩm nhập <span className="text-destructive">*</span>
        </Label>
        <select
          id="productId"
          value={selectedProductId}
          onChange={(e) => setValue('productId', e.target.value)}
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-card"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id} className="bg-popover text-popover-foreground">
              {p.name} ({p.sku}) - Hiện còn {p.remainingQuantity} chiếc
            </option>
          ))}
        </select>
        {errors.productId && (
          <p className="text-[11px] text-destructive">{errors.productId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Quantity */}
        <div className="space-y-1.5">
          <Label htmlFor="quantity" className="text-xs font-semibold">
            Số lượng nhập <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            placeholder="1"
            {...register('quantity', { valueAsNumber: true })}
            disabled={isSubmitting}
            className="h-9 text-sm font-mono"
          />
          {errors.quantity && (
            <p className="text-[11px] text-destructive">{errors.quantity.message}</p>
          )}
        </div>

        {/* Cost Price */}
        <div className="space-y-1.5">
          <Label htmlFor="costPrice" className="text-xs font-semibold">
            Đơn giá vốn (VND) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="costPrice"
            type="number"
            min={0}
            step={1000}
            placeholder="25000000"
            {...register('costPrice', { valueAsNumber: true })}
            disabled={isSubmitting}
            className="h-9 text-sm font-mono"
          />
          {errors.costPrice && (
            <p className="text-[11px] text-destructive">{errors.costPrice.message}</p>
          )}
        </div>
      </div>

      {/* Auto-calculated Total Cost Preview */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <CalculatorIcon className="size-3.5 text-primary" />
            Tổng chi phí nhập hàng (Tự động tính):
          </span>
          <span className="font-mono font-bold text-sm text-primary">
            {formatVND(totalCost)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Công thức: {watchQuantity || 0} (Số lượng) × {formatVND(Number(watchCostPrice) || 0)} (Giá vốn)
        </p>
      </div>

      {/* Import Date */}
      <div className="space-y-1.5">
        <Label htmlFor="importDate" className="text-xs font-semibold">
          Ngày nhập kho <span className="text-destructive">*</span>
        </Label>
        <Input
          id="importDate"
          type="date"
          {...register('importDate')}
          disabled={isSubmitting}
          className="h-9 text-sm"
        />
        {errors.importDate && (
          <p className="text-[11px] text-destructive">{errors.importDate.message}</p>
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
          Xác nhận tạo phiếu nhập
        </Button>
      </div>
    </form>
  )
}
