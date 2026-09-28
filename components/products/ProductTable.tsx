'use client'

import React from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  BoxesIcon,
} from 'lucide-react'
import { Product } from '@/types/product'
import { formatDate, formatNumber } from '@/lib/formatters'
import { EmptyState } from '@/components/common/EmptyState'

interface ProductTableProps {
  products: Product[]
  isLoading?: boolean
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onAddNew?: () => void
}

export function ProductTable({
  products,
  isLoading = false,
  onEdit,
  onDelete,
  onAddNew,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
        Đang tải danh sách sản phẩm...
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="Không tìm thấy sản phẩm"
        description="Không có sản phẩm nào khớp với bộ lọc hoặc danh mục đang trống."
        actionLabel={onAddNew ? 'Thêm sản phẩm mới' : undefined}
        onAction={onAddNew}
        icon={<BoxesIcon className="size-6" />}
      />
    )
  }

  const getStockBadge = (remaining: number) => {
    if (remaining <= 0) {
      return (
        <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50">
          Hết hàng
        </Badge>
      )
    }
    if (remaining <= 5) {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50">
          Sắp hết ({remaining})
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50">
        Còn hàng ({remaining})
      </Badge>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
            <TableHead className="w-[120px] font-semibold">SKU</TableHead>
            <TableHead className="min-w-[200px] font-semibold">Tên sản phẩm</TableHead>
            <TableHead className="font-semibold">Danh mục</TableHead>
            <TableHead className="text-right font-semibold">Đã nhập</TableHead>
            <TableHead className="text-right font-semibold">Đã bán</TableHead>
            <TableHead className="text-right font-semibold">Tồn kho</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Ngày tạo</TableHead>
            <TableHead className="text-right font-semibold w-[120px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="transition-colors hover:bg-muted/30 text-sm">
              <TableCell className="font-mono text-xs font-semibold text-primary">
                {product.sku}
              </TableCell>

              <TableCell className="font-medium text-foreground">
                <Link
                  href={`/products/${product.id}`}
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {product.name}
                </Link>
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-medium">
                  {product.category}
                </span>
              </TableCell>

              <TableCell className="text-right font-mono text-xs">
                {formatNumber(product.totalImported)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {formatNumber(product.totalSold)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                {formatNumber(product.remainingQuantity)}
              </TableCell>

              <TableCell>{getStockBadge(product.remainingQuantity)}</TableCell>

              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(product.createdAt)}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/products/${product.id}`}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
                      'hover:text-primary'
                    )}
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="size-3.5" />
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(product)}
                    title="Chỉnh sửa"
                    className="hover:text-amber-600"
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(product)}
                    title="Xóa sản phẩm"
                    className="hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
