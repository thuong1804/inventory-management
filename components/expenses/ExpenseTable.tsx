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
import { PencilIcon, Trash2Icon, ReceiptIcon } from 'lucide-react'
import { ExpenseRecord, ExpenseCategory } from '@/types/expense'
import { formatVND, formatDate } from '@/lib/formatters'
import { EmptyState } from '@/components/common/EmptyState'

interface ExpenseTableProps {
  expenses: ExpenseRecord[]
  isLoading?: boolean
  onEdit: (expense: ExpenseRecord) => void
  onDelete: (expense: ExpenseRecord) => void
  onAddNew?: () => void
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Shipping: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50',
  Packaging: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
  Marketing: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-900/50',
  Operation: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
  Other: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  Shipping: 'Vận chuyển',
  Packaging: 'Đóng gói',
  Marketing: 'Marketing',
  Operation: 'Vận hành',
  Other: 'Khác',
}

export function ExpenseTable({
  expenses,
  isLoading = false,
  onEdit,
  onDelete,
  onAddNew,
}: ExpenseTableProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-muted-foreground">
        Đang tải danh sách chi phí...
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="Chưa có khoản chi phí"
        description="Ghi nhận các khoản chi phí phát sinh để tính toán lợi nhuận ròng chính xác."
        actionLabel={onAddNew ? 'Thêm khoản chi mới' : undefined}
        onAction={onAddNew}
        icon={<ReceiptIcon className="size-6" />}
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
            <TableHead className="min-w-[200px] font-semibold">Tên chi phí</TableHead>
            <TableHead className="font-semibold">Danh mục</TableHead>
            <TableHead className="text-right font-semibold">Số tiền chi</TableHead>
            <TableHead className="font-semibold">Ngày chi</TableHead>
            <TableHead className="min-w-[200px] font-semibold">Ghi chú</TableHead>
            <TableHead className="text-right font-semibold w-[90px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id} className="transition-colors hover:bg-muted/30 text-sm">
              <TableCell className="font-medium text-foreground">
                {expense.name}
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    CATEGORY_COLORS[expense.category] || 'bg-muted text-muted-foreground'
                  }`}
                >
                  {CATEGORY_LABELS[expense.category] || expense.category}
                </Badge>
              </TableCell>

              <TableCell className="text-right font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                {formatVND(expense.amount)}
              </TableCell>

              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(expense.date)}
              </TableCell>

              <TableCell className="text-xs text-muted-foreground truncate max-w-[250px]">
                {expense.description || '—'}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onEdit(expense)}
                    title="Chỉnh sửa chi phí"
                    className="hover:text-amber-600"
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(expense)}
                    title="Xóa chi phí"
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
