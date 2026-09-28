'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { PlusIcon, SearchIcon, ShoppingCartIcon } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { SalesTable } from '@/components/sales/SalesTable'
import { SaleDialog } from '@/components/sales/SaleDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { saleService } from '@/services/sale.service'
import { importService } from '@/services/import.service'
import { SaleRecord } from '@/types/sale'
import { ImportRecord } from '@/types/import'
import { toast } from 'sonner'

const PAGE_SIZE = 8

export default function SalesPage() {
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [availableImports, setAvailableImports] = useState<ImportRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Search & Pagination
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [deletingSale, setDeletingSale] = useState<SaleRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [salesList, activeImports] = await Promise.all([
        saleService.getAll(),
        importService.getAvailableImports(),
      ])
      setSales(salesList)
      setAvailableImports(activeImports)
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

  const filteredSales = useMemo(() => {
    if (!search.trim()) return sales
    const q = search.toLowerCase().trim()
    return sales.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.productName.toLowerCase().includes(q) ||
        s.sku.toLowerCase().includes(q)
    )
  }, [sales, search])

  const totalPages = Math.ceil(filteredSales.length / PAGE_SIZE)
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredSales.slice(start, start + PAGE_SIZE)
  }, [filteredSales, currentPage])

  const handleDeleteConfirm = async () => {
    if (!deletingSale) return
    setIsDeleting(true)
    try {
      await saleService.delete(deletingSale.id)
      toast.success(
        `Đã xoá đơn bán ${deletingSale.id}. Số lượng tồn kho đã được hoàn lại thành công!`
      )
      setDeletingSale(null)
      loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xoá đơn bán hàng'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageContainer
      title="Quản lý Bán hàng (Sales Orders)"
      description="Quản lý các đơn xuất bán, theo dõi doanh thu và biên độ lợi nhuận từng đợt"
      actions={
        <Button onClick={() => setIsAddOpen(true)} size="sm" className="h-8 gap-1.5 text-xs">
          <PlusIcon className="size-3.5" />
          Tạo đơn bán hàng
        </Button>
      }
    >
      {/* Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, tên sản phẩm, SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShoppingCartIcon className="size-4" />
          <span>Tổng số {filteredSales.length} đơn hàng đã xuất</span>
        </div>
      </div>

      {/* Sales Table */}
      <div className="space-y-2">
        <SalesTable
          sales={paginatedSales}
          isLoading={isLoading}
          onDelete={(sale) => setDeletingSale(sale)}
          onAddNew={() => setIsAddOpen(true)}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSales.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Sale Modal */}
      <SaleDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        availableImports={availableImports}
        onSuccess={loadData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingSale)}
        onOpenChange={(open) => !open && setDeletingSale(null)}
        title="Xác nhận xoá đơn bán hàng"
        description={`Bạn có chắc chắn muốn xoá đơn bán ${deletingSale?.id} (${deletingSale?.productName} - SL: ${deletingSale?.quantity})? Sau khi xoá, ${deletingSale?.quantity} sản phẩm sẽ được tự động hoàn trả lại tồn kho lô ${deletingSale?.importId}.`}
        confirmText="Xác nhận xoá & Hoàn kho"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
