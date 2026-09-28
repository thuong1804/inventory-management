'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { SaleForm } from './SaleForm'
import { ImportRecord } from '@/types/import'
import { SaleFormValues } from '@/schemas/sale.schema'
import { saleService } from '@/services/sale.service'
import { toast } from 'sonner'

interface SaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableImports: ImportRecord[]
  onSuccess: () => void
}

export function SaleDialog({
  open,
  onOpenChange,
  availableImports,
  onSuccess,
}: SaleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: SaleFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await saleService.create(data)
      toast.success(
        `Đã tạo đơn bán ${result.id} thành công! Doanh thu: ${result.revenue.toLocaleString()} VND`
      )
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tạo đơn bán hàng'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Tạo đơn Bán hàng mới (New Sale)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Chọn lô hàng có sẵn trong kho để xuất bán, kiểm tra số lượng tồn và lợi nhuận
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <SaleForm
            availableImports={availableImports}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
