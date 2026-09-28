'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ExpenseForm } from './ExpenseForm'
import { ExpenseRecord } from '@/types/expense'
import { ExpenseFormValues } from '@/schemas/expense.schema'
import { expenseService } from '@/services/expense.service'
import { toast } from 'sonner'

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: ExpenseRecord | null
  onSuccess: () => void
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  onSuccess,
}: ExpenseDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(expense)

  const handleSubmit = async (data: ExpenseFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing && expense) {
        await expenseService.update(expense.id, data)
        toast.success(`Đã cập nhật chi phí "${data.name}" thành công!`)
      } else {
        await expenseService.create(data)
        toast.success(`Đã thêm mới khoản chi phí "${data.name}"!`)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể lưu khoản chi phí'
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
            {isEditing ? 'Chỉnh sửa khoản chi phí' : 'Thêm mới Khoản chi phí'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ghi nhận chi phí phục vụ tính toán Lợi nhuận ròng (Net Profit)
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <ExpenseForm
            key={expense?.id || 'new'}
            defaultValues={
              expense
                ? {
                    name: expense.name,
                    category: expense.category,
                    amount: expense.amount,
                    date: expense.date,
                    description: expense.description,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
