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
import { Button } from '@/components/ui/button'
import { Trash2Icon, ShoppingCartIcon } from 'lucide-react'
import { SaleRecord } from '@/types/sale'
import { formatVND, formatDate, formatNumber } from '@/lib/formatters'
import { EmptyState } from '@/components/common/EmptyState'

interface SalesTableProps {
  sales: SaleRecord[]
  isLoading?: boolean
  onDelete: (sale: SaleRecord) => void
  onAddNew?: () => void
}

export function SalesTable({
  sales,
  isLoading = false,
  onDelete,
  onAddNew,
}: SalesTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
        Đang tải danh sách đơn bán hàng...
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <EmptyState
        title="Chưa có đơn bán hàng"
        description="Bắt đầu tạo đơn bán hàng từ các lô hàng sẵn có trong kho."
        actionLabel={onAddNew ? 'Tạo đơn bán đầu tiên' : undefined}
        onAction={onAddNew}
        icon={<ShoppingCartIcon className="size-6" />}
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
            <TableHead className="w-[110px] font-semibold">Mã đơn</TableHead>
            <TableHead className="min-w-[180px] font-semibold">Sản phẩm</TableHead>
            <TableHead className="text-right font-semibold">Số lượng</TableHead>
            <TableHead className="text-right font-semibold">Giá vốn</TableHead>
            <TableHead className="text-right font-semibold">Giá bán</TableHead>
            <TableHead className="text-right font-semibold">Doanh thu</TableHead>
            <TableHead className="text-right font-semibold">Lợi nhuận</TableHead>
            <TableHead className="min-w-[140px] font-semibold">Người mua</TableHead>
            <TableHead className="font-semibold">Ngày bán</TableHead>
            <TableHead className="text-right font-semibold w-[80px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id} className="transition-colors hover:bg-muted/30 text-sm">
              <TableCell className="font-mono text-xs font-semibold text-primary">
                {sale.id}
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{sale.productName}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{sale.sku}</span>
                </div>
              </TableCell>

              <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                {formatNumber(sale.quantity)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs text-amber-600 dark:text-amber-400">
                {formatVND(sale.costPrice)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs font-medium text-foreground">
                {formatVND(sale.sellingPrice)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs font-bold text-foreground">
                {formatVND(sale.revenue)}
              </TableCell>

              <TableCell className="text-right font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{formatVND(sale.profit)}
              </TableCell>

              <TableCell className="text-xs">
                {sale.buyerName ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">{sale.buyerName}</span>
                    {sale.buyerPhone && (
                      <span className="font-mono text-[11px] text-muted-foreground">{sale.buyerPhone}</span>
                    )}
                    {sale.buyerAddress && (
                      <span className="text-[11px] text-muted-foreground truncate max-w-[160px]" title={sale.buyerAddress}>{sale.buyerAddress}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>

              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(sale.soldDate)}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onDelete(sale)}
                  title="Xóa đơn bán (hoàn lại tồn kho)"
                  className="hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
