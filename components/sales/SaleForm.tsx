'use client'

import React, { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { saleSchema, SaleFormValues } from '@/schemas/sale.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImportRecord } from '@/types/import'
import { formatVND, toInputDate } from '@/lib/formatters'
import { Loader2Icon, CalculatorIcon, AlertCircleIcon } from 'lucide-react'

interface SaleFormProps {
  availableImports: ImportRecord[]
  onSubmit: (data: SaleFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function SaleForm({
  availableImports,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: SaleFormProps) {
  const defaultImport = availableImports[0]

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      importId: defaultImport?.id || '',
      quantity: 1,
      sellingPrice: defaultImport ? Math.round(defaultImport.costPrice * 1.2) : 0,
      soldDate: toInputDate(),
    },
  })

  const selectedImportId = watch('importId')
  const watchQuantity = watch('quantity')
  const watchSellingPrice = watch('sellingPrice')

  const selectedImport = useMemo(() => {
    return availableImports.find((i) => i.id === selectedImportId) || null
  }, [availableImports, selectedImportId])

  // Real-time calculations
  const calculations = useMemo(() => {
    const qty = Number(watchQuantity) || 0
    const price = Number(watchSellingPrice) || 0
    const costPrice = selectedImport ? selectedImport.costPrice : 0

    const revenue = qty * price
    const cost = qty * costPrice
    const profit = revenue - cost
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

    return {
      revenue,
      cost,
      profit,
      profitMargin,
      remaining: selectedImport ? selectedImport.remainingQuantity : 0,
      isExceeded: selectedImport ? qty > selectedImport.remainingQuantity : false,
    }
  }, [watchQuantity, watchSellingPrice, selectedImport])

  // Custom submit handler to double check inventory limit
  const handleFormSubmit = (data: SaleFormValues) => {
    if (selectedImport && data.quantity > selectedImport.remainingQuantity) {
      setError('quantity', {
        type: 'manual',
        message: `Số lượng bán vượt quá tồn kho còn lại (${selectedImport.remainingQuantity} chiếc)!`,
      })
      return
    }
    clearErrors('quantity')
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Import Record / Product Select */}
      <div className="space-y-1.5">
        <Label htmlFor="importId" className="text-xs font-semibold">
          Chọn Lô hàng xuất bán <span className="text-destructive">*</span>
        </Label>
        {availableImports.length === 0 ? (
          <p className="text-xs text-destructive">
            Hiện tại không có lô hàng nào còn tồn kho để bán. Vui lòng nhập hàng trước!
          </p>
        ) : (
          <select
            id="importId"
            value={selectedImportId}
            onChange={(e) => {
              const newId = e.target.value
              setValue('importId', newId)
              const imp = availableImports.find((i) => i.id === newId)
              if (imp) {
                // Pre-fill suggested selling price (e.g. 15-20% margin)
                setValue('sellingPrice', Math.round(imp.costPrice * 1.2))
              }
            }}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-card"
          >
            {availableImports.map((imp) => (
              <option key={imp.id} value={imp.id} className="bg-popover text-popover-foreground">
                {imp.productName} ({imp.sku}) — Còn {imp.remainingQuantity} cái (Vốn: {formatVND(imp.costPrice)})
              </option>
            ))}
          </select>
        )}
        {errors.importId && (
          <p className="text-[11px] text-destructive">{errors.importId.message}</p>
        )}
      </div>

      {/* Selected Batch Inventory Banner */}
      {selectedImport && (
        <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 p-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Tồn kho lô này:</span>
            <span className="font-mono font-bold text-foreground">
              {selectedImport.remainingQuantity} chiếc
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Giá vốn nhập:</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {formatVND(selectedImport.costPrice)}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Quantity */}
        <div className="space-y-1.5">
          <Label htmlFor="quantity" className="text-xs font-semibold">
            Số lượng bán <span className="text-destructive">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={selectedImport ? selectedImport.remainingQuantity : undefined}
            placeholder="1"
            {...register('quantity', { valueAsNumber: true })}
            disabled={isSubmitting}
            className="h-9 text-sm font-mono"
          />
          {errors.quantity && (
            <p className="text-[11px] text-destructive">{errors.quantity.message}</p>
          )}
          {calculations.isExceeded && (
            <p className="flex items-center gap-1 text-[11px] text-destructive font-medium">
              <AlertCircleIcon className="size-3" />
              Vượt quá số lượng tồn kho ({calculations.remaining})!
            </p>
          )}
        </div>

        {/* Selling Price */}
        <div className="space-y-1.5">
          <Label htmlFor="sellingPrice" className="text-xs font-semibold">
            Đơn giá bán ra (VND) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sellingPrice"
            type="number"
            min={0}
            step={1000}
            placeholder="30000000"
            {...register('sellingPrice', { valueAsNumber: true })}
            disabled={isSubmitting}
            className="h-9 text-sm font-mono"
          />
          {errors.sellingPrice && (
            <p className="text-[11px] text-destructive">{errors.sellingPrice.message}</p>
          )}
        </div>
      </div>

      {/* Sale Date */}
      <div className="space-y-1.5">
        <Label htmlFor="soldDate" className="text-xs font-semibold">
          Ngày bán hàng <span className="text-destructive">*</span>
        </Label>
        <Input
          id="soldDate"
          type="date"
          {...register('soldDate')}
          disabled={isSubmitting}
          className="h-9 text-sm"
        />
        {errors.soldDate && (
          <p className="text-[11px] text-destructive">{errors.soldDate.message}</p>
        )}
      </div>

      {/* Buyer Information (optional) */}
      <div className="space-y-2.5 rounded-lg border border-border/60 bg-muted/20 p-3">
        <p className="text-xs font-semibold text-foreground">
          Thông tin người mua <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="buyerName" className="text-xs text-muted-foreground">
            Tên người mua
          </Label>
          <Input
            id="buyerName"
            type="text"
            placeholder="Nguyễn Văn A"
            {...register('buyerName')}
            disabled={isSubmitting}
            className="h-9 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="buyerPhone" className="text-xs text-muted-foreground">
              Số điện thoại
            </Label>
            <Input
              id="buyerPhone"
              type="text"
              placeholder="0901234567"
              {...register('buyerPhone')}
              disabled={isSubmitting}
              className="h-9 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="buyerAddress" className="text-xs text-muted-foreground">
              Địa chỉ
            </Label>
            <Input
              id="buyerAddress"
              type="text"
              placeholder="123 Lê Lợi, Q.1, TP.HCM"
              {...register('buyerAddress')}
              disabled={isSubmitting}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Automatic Financial Calculation Card (Revenue, Cost, Profit) */}
      <div className="space-y-2 rounded-lg border border-border/80 bg-muted/30 p-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <CalculatorIcon className="size-3.5 text-primary" />
          <span>Tự động tính toán tài chính đơn hàng:</span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/60">
          <div>
            <span className="text-muted-foreground block text-[11px]">Doanh thu</span>
            <span className="font-mono font-bold text-foreground">
              {formatVND(calculations.revenue)}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Giá vốn</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {formatVND(calculations.cost)}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px]">Lợi nhuận</span>
            <span
              className={`font-mono font-bold ${
                calculations.profit >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600'
              }`}
            >
              {formatVND(calculations.profit)}
            </span>
          </div>
        </div>

        {calculations.revenue > 0 && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>Tỷ suất lợi nhuận gộp:</span>
            <span className="font-semibold text-foreground font-mono">
              {calculations.profitMargin.toFixed(1)}%
            </span>
          </div>
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
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            calculations.isExceeded ||
            availableImports.length === 0
          }
          size="sm"
        >
          {isSubmitting && <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />}
          Xác nhận tạo đơn bán
        </Button>
      </div>
    </form>
  )
}
