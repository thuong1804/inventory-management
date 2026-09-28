'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImportRecord } from '@/types/import'
import { formatVND, formatDate, formatNumber } from '@/lib/formatters'
import { PackageIcon, CalendarIcon, DollarSignIcon } from 'lucide-react'

interface ImportDetailDialogProps {
  importItem: ImportRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDetailDialog({
  importItem,
  open,
  onOpenChange,
}: ImportDetailDialogProps) {
  if (!importItem) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="text-base font-semibold">
              Chi tiết Phiếu nhập {importItem.id}
            </DialogTitle>
            {importItem.status === 'sold_out' ? (
              <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                Đã bán hết
              </Badge>
            ) : importItem.status === 'partially_sold' ? (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 text-xs">
                Đang bán dở
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-xs">
                Mới nhập (Nguyên vẹn)
              </Badge>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Thông tin chi tiết lô hàng, giá nhập vốn và trạng thái xuất bán
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Product info banner */}
          <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/40 p-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PackageIcon className="size-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                {importItem.productName}
              </h4>
              <p className="text-xs font-mono text-muted-foreground">
                SKU: {importItem.sku}
              </p>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border/60 p-3">
              <span className="text-muted-foreground">Số lượng đã nhập</span>
              <p className="mt-1 font-mono text-base font-bold text-foreground">
                {formatNumber(importItem.quantity)} cái
              </p>
            </div>

            <div className="rounded-lg border border-border/60 p-3">
              <span className="text-muted-foreground">Đơn giá vốn</span>
              <p className="mt-1 font-mono text-base font-bold text-amber-600 dark:text-amber-400">
                {formatVND(importItem.costPrice)}
              </p>
            </div>

            <div className="rounded-lg border border-border/60 p-3">
              <span className="text-muted-foreground">Đã bán từ lô này</span>
              <p className="mt-1 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatNumber(importItem.soldQuantity)} cái
              </p>
            </div>

            <div className="rounded-lg border border-border/60 p-3">
              <span className="text-muted-foreground">Tồn kho còn lại</span>
              <p className="mt-1 font-mono text-base font-bold text-primary">
                {formatNumber(importItem.remainingQuantity)} cái
              </p>
            </div>
          </div>

          {/* Total Cost summary */}
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3.5 border border-border/60">
            <div className="flex items-center gap-2 text-xs">
              <DollarSignIcon className="size-4 text-primary" />
              <span className="font-semibold text-foreground">Tổng chi phí nhập lô:</span>
            </div>
            <span className="font-mono text-base font-bold text-foreground">
              {formatVND(importItem.totalCost)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            <span>Ngày nhập kho: {formatDate(importItem.importDate)}</span>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
