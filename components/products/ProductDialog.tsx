'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ProductForm } from './ProductForm'
import { Product } from '@/types/product'
import { ProductFormValues } from '@/schemas/product.schema'
import { productService } from '@/services/product.service'
import { toast } from 'sonner'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  categories: string[]
  onSuccess: () => void
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: ProductDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(product)

  const handleSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      if (isEditing && product) {
        await productService.update(product.id, data)
        toast.success(`Đã cập nhật sản phẩm "${data.name}" thành công!`)
      } else {
        await productService.create(data)
        toast.success(`Đã thêm mới sản phẩm "${data.name}" thành công!`)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lưu sản phẩm'
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
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm mới sản phẩm'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? 'Cập nhật thông tin tên, SKU và danh mục sản phẩm'
              : 'Nhập thông tin sản phẩm mới vào danh mục kho'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <ProductForm
            key={product?.id || 'new'}
            defaultValues={
              product
                ? {
                    name: product.name,
                    sku: product.sku,
                    category: product.category,
                  }
                : undefined
            }
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
