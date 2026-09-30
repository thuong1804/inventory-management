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
  // Deduplicate categories and remove empty items
  const uniqueCategories = React.useMemo(() => {
    const seen = new Set<string>()
    const list: string[] = []
    for (const cat of categories) {
      const trimmed = cat.trim()
      if (trimmed && !seen.has(trimmed.toLowerCase())) {
        seen.add(trimmed.toLowerCase())
        list.push(trimmed)
      }
    }
    return list
  }, [categories])

  const initialCat = defaultValues?.category || uniqueCategories[0] || 'Điện thoại & Tablet'
  const isInitialCustom = Boolean(
    defaultValues?.category &&
    !uniqueCategories.some((c) => c.toLowerCase() === defaultValues.category?.toLowerCase())
  )

  const [isCustom, setIsCustom] = React.useState<boolean>(isInitialCustom)
  const [customValue, setCustomValue] = React.useState<string>(
    isInitialCustom ? (defaultValues?.category || '') : ''
  )

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
      category: isInitialCustom ? (defaultValues?.category || '') : initialCat,
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
            value={isCustom ? '__custom__' : currentCategory}
            onChange={(e) => {
              const val = e.target.value
              if (val === '__custom__') {
                setIsCustom(true)
                setValue('category', customValue.trim(), { shouldValidate: true })
              } else {
                setIsCustom(false)
                setValue('category', val, { shouldValidate: true })
              }
            }}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-card"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-popover text-popover-foreground">
                {cat}
              </option>
            ))}
            <option value="__custom__" className="bg-popover text-popover-foreground">
              + Khác (Nhập tùy chỉnh)
            </option>
          </select>

          {isCustom && (
            <div className="space-y-1 pt-0.5">
              <Input
                placeholder="Nhập tên danh mục mới..."
                value={customValue}
                autoFocus
                disabled={isSubmitting}
                onChange={(e) => {
                  const val = e.target.value
                  setCustomValue(val)
                  setValue('category', val, { shouldValidate: true })
                }}
                className="h-8 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Nhập tên danh mục tùy chỉnh cho sản phẩm này
              </p>
            </div>
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
