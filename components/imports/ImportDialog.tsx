'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ImportForm } from './ImportForm'
import { Product } from '@/types/product'
import { ImportFormValues } from '@/schemas/import.schema'
import { importService } from '@/services/import.service'
import { toast } from 'sonner'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Product[]
  onSuccess: () => void
}

export function ImportDialog({
  open,
  onOpenChange,
  products,
  onSuccess,
}: ImportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: ImportFormValues) => {
    setIsSubmitting(true)
    try {
      const result = await importService.create(data)
      toast.success(
        `Đã tạo phiếu nhập ${result.id} thành công với ${data.quantity} sản phẩm!`
      )
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tạo phiếu nhập hàng'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Tạo phiếu Nhập hàng mới
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Nhập sản phẩm vào kho, tự động cập nhật số lượng tồn và lịch sử giá vốn
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <ImportForm
            products={products}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
