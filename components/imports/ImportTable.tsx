'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EyeIcon, Trash2Icon, PackagePlusIcon } from 'lucide-react'
import { ImportRecord } from '@/types/import'
import { formatVND, formatDate, formatNumber } from '@/lib/formatters'
import { EmptyState } from '@/components/common/EmptyState'

interface ImportTableProps {
  imports: ImportRecord[]
  isLoading?: boolean
  onView: (item: ImportRecord) => void
  onDelete: (item: ImportRecord) => void
  onAddNew?: () => void
}

export function ImportTable({
  imports,
  isLoading = false,
  onView,
  onDelete,
  onAddNew,
}: ImportTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
        Đang tải danh sách phiếu nhập kho...
      </div>
    )
  }

  if (imports.length === 0) {
    return (
      <EmptyState
        title="Chưa có phiếu nhập hàng"
        description="Bắt đầu tạo phiếu nhập hàng mới để cập nhật số lượng tồn kho."
        actionLabel={onAddNew ? 'Tạo phiếu nhập mới' : undefined}
        onAction={onAddNew}
        icon={<PackagePlusIcon className="size-6" />}
      />
    )
  }

  const getStatusBadge = (status: ImportRecord['status'], remaining: number) => {
    if (status === 'sold_out' || remaining === 0) {
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-[11px]">
          Đã bán hết
        </Badge>
      )
    }
    if (status === 'partially_sold') {
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 text-[11px]">
          Đang bán dở
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 text-[11px]">
        Sẵn sàng bán
      </Badge>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
            <TableHead className="w-[110px] font-semibold">Mã phiếu</TableHead>
            <TableHead className="min-w-[180px] font-semibold">Sản phẩm</TableHead>
            <TableHead className="text-right font-semibold">Số lượng</TableHead>
            <TableHead className="text-right font-semibold">Giá vốn</TableHead>
            <TableHead className="text-right font-semibold">Tổng vốn</TableHead>
            <TableHead className="text-right font-semibold">Còn lại</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Ngày nhập</TableHead>
            <TableHead className="text-right font-semibold w-[90px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {imports.map((item) => (
            <TableRow key={item.id} className="transition-colors hover:bg-muted/30 text-sm">
              <TableCell className="font-mono text-xs font-semibold text-primary">
                {item.id}
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{item.productName}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{item.sku}</span>
                </div>
              </TableCell>

              <TableCell className="text-right font-mono text-xs">
                {formatNumber(item.quantity)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs text-amber-600 dark:text-amber-400 font-medium">
                {formatVND(item.costPrice)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                {formatVND(item.totalCost)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                {formatNumber(item.remainingQuantity)}
              </TableCell>

              <TableCell>{getStatusBadge(item.status, item.remainingQuantity)}</TableCell>

              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(item.importDate)}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onView(item)}
                    title="Xem chi tiết"
                    className="hover:text-primary"
                  >
                    <EyeIcon className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(item)}
                    title={
                      item.soldQuantity > 0
                        ? `Không thể xóa vì đã bán ${item.soldQuantity} cái`
                        : 'Xóa phiếu nhập'
                    }
                    disabled={item.soldQuantity > 0}
                    className="hover:text-destructive hover:bg-destructive/10 disabled:opacity-30"
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
