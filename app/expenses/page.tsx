'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { ExpenseDialog } from '@/components/expenses/ExpenseDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { expenseService } from '@/services/expense.service'
import { ExpenseRecord } from '@/types/expense'
import { expenseCategories } from '@/schemas/expense.schema'
import { formatVND } from '@/lib/formatters'
import { toast } from 'sonner'

const PAGE_SIZE = 8

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null)
  const [deletingExpense, setDeletingExpense] = useState<ExpenseRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const items = await expenseService.getAll()
      setExpenses(items)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()

    const handleUpdate = () => {
      loadData()
    }
    window.addEventListener('inventory_storage_updated', handleUpdate)
    return () => window.removeEventListener('inventory_storage_updated', handleUpdate)
  }, [loadData])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        !search.trim() ||
        e.name.toLowerCase().includes(search.toLowerCase().trim()) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase().trim()))

      const matchCategory =
        selectedCategory === 'all' || e.category === selectedCategory

      return matchSearch && matchCategory
    })
  }, [expenses, search, selectedCategory])

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + e.amount, 0)
  }, [filteredExpenses])

  const totalPages = Math.ceil(filteredExpenses.length / PAGE_SIZE)
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredExpenses.slice(start, start + PAGE_SIZE)
  }, [filteredExpenses, currentPage])

  const handleOpenAdd = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (e: ExpenseRecord) => {
    setEditingExpense(e)
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return
    setIsDeleting(true)
    try {
      await expenseService.delete(deletingExpense.id)
      toast.success(`Đã xoá khoản chi "${deletingExpense.name}"`)
      setDeletingExpense(null)
      loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xoá khoản chi'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageContainer
      title="Quản lý Chi phí (Expenses)"
      description="Ghi nhận các khoản chi phí vận hành, marketing, giao hàng để tính toán lợi nhuận ròng"
      actions={
        <Button onClick={handleOpenAdd} size="sm" className="h-8 gap-1.5 text-xs">
          <PlusIcon className="size-3.5" />
          Thêm chi phí mới
        </Button>
      }
    >
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên chi phí, ghi chú..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="h-9 pl-9 text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
            className="h-9 rounded-lg border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">Tất cả danh mục chi</option>
            {expenseCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Tổng chi phí hiển thị:</span>
          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
            {formatVND(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="space-y-2">
        <ExpenseTable
          expenses={paginatedExpenses}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={(e) => setDeletingExpense(e)}
          onAddNew={handleOpenAdd}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredExpenses.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Expense Modal (Add / Edit) */}
      <ExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expense={editingExpense}
        onSuccess={loadData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingExpense)}
        onOpenChange={(open) => !open && setDeletingExpense(null)}
        title="Xác nhận xoá chi phí"
        description={`Bạn có chắc chắn muốn xoá khoản chi "${deletingExpense?.name}" với số tiền ${formatVND(deletingExpense?.amount || 0)}?`}
        confirmText="Xác nhận xoá"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
