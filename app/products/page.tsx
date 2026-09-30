'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { PlusIcon, SearchIcon, RefreshCwIcon } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductDialog } from '@/components/products/ProductDialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { productService } from '@/services/product.service'
import { Product, StockStatus } from '@/types/product'
import { toast } from 'sonner'

const PAGE_SIZE = 8

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Search
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStock, setSelectedStock] = useState<StockStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Modals
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [items, cats] = await Promise.all([
        productService.getAll({
          search,
          category: selectedCategory,
          stockStatus: selectedStock,
        }),
        productService.getCategories(),
      ])
      setProducts(items)
      setCategories(cats)
    } finally {
      setIsLoading(false)
    }
  }, [search, selectedCategory, selectedStock])

  useEffect(() => {
    loadData()

    const handleUpdate = () => {
      loadData()
    }
    window.addEventListener('inventory_storage_updated', handleUpdate)
    return () => window.removeEventListener('inventory_storage_updated', handleUpdate)
  }, [loadData])

  // Pagination calculation
  const totalPages = Math.ceil(products.length / PAGE_SIZE)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return products.slice(start, start + PAGE_SIZE)
  }, [products, currentPage])

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return
    setIsDeleting(true)
    try {
      await productService.delete(deletingProduct.id)
      toast.success(`Đã xoá sản phẩm "${deletingProduct.name}"`)
      setDeletingProduct(null)
      loadData()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xoá sản phẩm'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <PageContainer
      title="Danh sách Sản phẩm"
      description="Quản lý thông tin mã SKU, số lượng nhập xuất và tồn kho hiện tại"
      actions={
        <Button onClick={handleOpenAdd} size="sm" className="h-8 gap-1.5 text-xs">
          <PlusIcon className="size-3.5" />
          Thêm sản phẩm mới
        </Button>
      }
    >
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sản phẩm, mã SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="h-9 pl-9 text-xs"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Danh mục:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Tất cả danh mục</option>
              {Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean))).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Tồn kho:</span>
            <select
              value={selectedStock}
              onChange={(e) => {
                setSelectedStock(e.target.value as StockStatus | 'all')
                setCurrentPage(1)
              }}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="in_stock">Còn hàng (&gt; 5)</option>
              <option value="low_stock">Sắp hết hàng (1-5)</option>
              <option value="out_of_stock">Hết hàng (0)</option>
            </select>
          </div>

          {(search || selectedCategory !== 'all' || selectedStock !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setSelectedCategory('all')
                setSelectedStock('all')
              }}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCwIcon className="mr-1 size-3" />
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* Products Table with Pagination */}
      <div className="space-y-2">
        <ProductTable
          products={paginatedProducts}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={(p) => setDeletingProduct(p)}
          onAddNew={handleOpenAdd}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={products.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Product Form Modal (Add / Edit) */}
      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        categories={categories}
        onSuccess={loadData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="Xác nhận xoá sản phẩm"
        description={`Bạn có chắc chắn muốn xoá sản phẩm "${deletingProduct?.name}" (${deletingProduct?.sku})? Lưu ý: Không thể xoá sản phẩm nếu đã có phiếu nhập kho liên quan.`}
        confirmText="Xác nhận xoá"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
