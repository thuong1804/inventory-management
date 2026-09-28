'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormValues } from '@/schemas/product.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2Icon } from 'lucide-react'

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>
  onSubmit: (data: ProductFormValues) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  categories: string[]
}

export function ProductForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  categories,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      sku: defaultValues?.sku || '',
      category: defaultValues?.category || (categories[0] || 'Điện thoại & Tablet'),
    },
  })

  const currentCategory = watch('category')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Product Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-semibold">
          Tên sản phẩm <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Ví dụ: iPhone 15 Pro Max 256GB"
          {...register('name')}
          disabled={isSubmitting}
          className="h-9 text-sm"
        />
        {errors.name && (
          <p className="text-[11px] text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* SKU */}
      <div className="space-y-1.5">
        <Label htmlFor="sku" className="text-xs font-semibold">
          Mã SKU <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sku"
          placeholder="Ví dụ: IPHONE-15-PM"
          {...register('sku')}
          disabled={isSubmitting}
          className="h-9 font-mono text-sm uppercase"
        />
        {errors.sku && (
          <p className="text-[11px] text-destructive">{errors.sku.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category" className="text-xs font-semibold">
          Danh mục <span className="text-destructive">*</span>
        </Label>
        <div className="space-y-2">
          <select
            id="category"
            value={currentCategory}
            onChange={(e) => setValue('category', e.target.value)}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-card"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-popover text-popover-foreground">
                {cat}
              </option>
            ))}
            <option value="Khác" className="bg-popover text-popover-foreground">
              + Khác (Nhập tùy chỉnh)
            </option>
          </select>

          {currentCategory === 'Khác' && (
            <Input
              placeholder="Nhập tên danh mục mới..."
              onChange={(e) => setValue('category', e.target.value)}
              className="h-8 text-xs"
            />
          )}
        </div>
        {errors.category && (
          <p className="text-[11px] text-destructive">{errors.category.message}</p>
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
          {defaultValues?.name ? 'Lưu cập nhật' : 'Thêm sản phẩm'}
        </Button>
      </div>
    </form>
  )
}
