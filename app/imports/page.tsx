'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { PlusIcon, SearchIcon, ArrowDownToLineIcon } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { ImportTable } from '@/components/imports/ImportTable'
import { ImportDialog } from '@/components/imports/ImportDialog'
import { ImportDetailDialog } from '@/components/imports/ImportDetailDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { importService } from '@/services/import.service'
import { productService } from '@/services/product.service'
import { ImportRecord } from '@/types/import'
import { Product } from '@/types/product'
import { toast } from 'sonner'

const PAGE_SIZE = 8

export default function ImportsPage() {
  const [imports, setImports] = useState<ImportRecord[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Search & Filter
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [viewingImport, setViewingImport] = useState<ImportRecord | null>(null)
  const [deletingImport, setDeletingImport] = useState<ImportRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [impList, prodList] = await Promise.all([
        importService.getAll(),
        productService.getAll(),
      ])
      setImports(impList)
      setProducts(prodList)
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

  const filteredImports = useMemo(() => {
    if (!search.trim()) return imports
    const q = search.toLowerCase().trim()
    return imports.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
    )
  }, [imports, search])

  const totalPages = Math.ceil(filteredImports.length / PAGE_SIZE)
  const paginatedImports = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredImports.slice(start, start + PAGE_SIZE)
  }, [filteredImports, currentPage])

  const handleDeleteConfirm = async () => {
    if (!deletingImport) return
    setIsDeleting(true)
    try {
      await importService.delete(deletingImport.id)
      toast.success(`Đã xoá phiếu nhập ${deletingImport.id}`)
      setDeletingImport(null)
      loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xoá phiếu nhập'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageContainer
      title="Quản lý Nhập kho (Import Products)"
      description="Ghi nhận các lô hàng nhập về kho, quản lý giá vốn và số lượng còn lại"
      actions={
        <Button onClick={() => setIsAddOpen(true)} size="sm" className="h-8 gap-1.5 text-xs">
          <PlusIcon className="size-3.5" />
          Tạo phiếu nhập mới
        </Button>
      }
    >
      {/* Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã phiếu, sản phẩm, SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowDownToLineIcon className="size-4" />
          <span>Tổng số {filteredImports.length} phiếu nhập kho</span>
        </div>
      </div>

      {/* Import Table */}
      <div className="space-y-2">
        <ImportTable
          imports={paginatedImports}
          isLoading={isLoading}
          onView={(item) => setViewingImport(item)}
          onDelete={(item) => setDeletingImport(item)}
          onAddNew={() => setIsAddOpen(true)}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredImports.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Import Dialog */}
      <ImportDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        products={products}
        onSuccess={loadData}
      />

      {/* View Import Detail Modal */}
      <ImportDetailDialog
        importItem={viewingImport}
        open={Boolean(viewingImport)}
        onOpenChange={(open) => !open && setViewingImport(null)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingImport)}
        onOpenChange={(open) => !open && setDeletingImport(null)}
        title="Xác nhận xoá phiếu nhập"
        description={`Bạn có chắc chắn muốn xoá phiếu nhập ${deletingImport?.id} của sản phẩm "${deletingImport?.productName}"? Số lượng tồn kho của sản phẩm sẽ được tự động trừ lùi tương ứng.`}
        confirmText="Xác nhận xoá"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
