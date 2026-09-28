'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  PackageIcon,
  ShoppingCartIcon,
  ArrowDownToLineIcon,
  CalendarIcon,
  TagIcon,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { productService } from '@/services/product.service'
import { importService } from '@/services/import.service'
import { saleService } from '@/services/sale.service'
import { Product } from '@/types/product'
import { ImportRecord } from '@/types/import'
import { SaleRecord } from '@/types/sale'
import { formatVND, formatDate, formatNumber } from '@/lib/formatters'
import { EmptyState } from '@/components/common/EmptyState'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [imports, setImports] = useState<ImportRecord[]>([])
  const [sales, setSales] = useState<SaleRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadProductDetail = useCallback(async () => {
    if (!id) return
    try {
      const [prod, imps, sls] = await Promise.all([
        productService.getById(id),
        importService.getByProductId(id),
        saleService.getByProductId(id),
      ])
      setProduct(prod)
      setImports(imps)
      setSales(sls)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProductDetail()

    const handleUpdate = () => {
      loadProductDetail()
    }
    window.addEventListener('inventory_storage_updated', handleUpdate)
    return () => window.removeEventListener('inventory_storage_updated', handleUpdate)
  }, [loadProductDetail])

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Đang tải thông tin chi tiết sản phẩm...
        </div>
      </PageContainer>
    )
  }

  if (!product) {
    return (
      <PageContainer>
        <div className="py-12">
          <EmptyState
            title="Không tìm thấy sản phẩm"
            description="Sản phẩm này có thể đã bị xoá hoặc liên kết không hợp lệ."
            actionLabel="Quay lại danh sách sản phẩm"
            onAction={() => router.push('/products')}
          />
        </div>
      </PageContainer>
    )
  }

  // Calculate product-specific financials
  const totalCost = sales.reduce((acc, s) => acc + s.cost, 0)
  const totalRevenue = sales.reduce((acc, s) => acc + s.revenue, 0)
  const totalProfit = totalRevenue - totalCost
  const totalImportExpense = imports.reduce((acc, i) => acc + i.totalCost, 0)

  return (
    <PageContainer
      title={product.name}
      description={`Mã SKU: ${product.sku} • Danh mục: ${product.category}`}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 gap-1.5 text-xs')}
          >
            <ArrowLeftIcon className="size-3.5" />
            Quay lại danh sách
          </Link>

          <Link
            href="/imports"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 gap-1.5 text-xs')}
          >
            <ArrowDownToLineIcon className="size-3.5" />
            Nhập hàng
          </Link>

          <Link
            href="/sales"
            className={cn(buttonVariants({ size: 'sm' }), 'h-8 gap-1.5 text-xs')}
          >
            <ShoppingCartIcon className="size-3.5" />
            Bán hàng
          </Link>
        </div>
      }
    >
      {/* Product Highlights Card */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PackageIcon className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                <Badge variant="outline" className="font-mono text-xs">
                  {product.sku}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TagIcon className="size-3.5" />
                  {product.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="size-3.5" />
                  Ngày tạo: {formatDate(product.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            {product.remainingQuantity > 5 ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-xs px-3 py-1 font-medium">
                Tồn kho sẵn sàng ({product.remainingQuantity})
              </Badge>
            ) : product.remainingQuantity > 0 ? (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 text-xs px-3 py-1 font-medium">
                Cảnh báo sắp hết ({product.remainingQuantity})
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 text-xs px-3 py-1 font-medium">
                Đã hết hàng
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards as specified in Section 9 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Đã nhập (Imported)
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-foreground">
              {formatNumber(product.totalImported)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Vốn nhập: {formatVND(totalImportExpense)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Đã bán (Sold)
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatNumber(product.totalSold)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Số lượng xuất kho</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tồn kho (Remaining)
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-primary">
              {formatNumber(product.remainingQuantity)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Khả dụng trong kho</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Giá vốn đã bán
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatVND(totalCost)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total Cost of Sold</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tổng doanh thu
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatVND(totalRevenue)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs bg-emerald-500/5 border-emerald-500/30">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Lợi nhuận gộp
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
              {formatVND(totalProfit)}
            </p>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">Doanh thu - Giá vốn</p>
          </CardContent>
        </Card>
      </div>

      {/* Import History & Sales History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Import History */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Lịch sử Nhập hàng (Import History)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Các lô hàng đã nhập về kho cho sản phẩm này
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {imports.length} lô
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {imports.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Chưa có phiếu nhập"
                  description="Sản phẩm này chưa từng có lô nhập hàng nào."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/30">
                      <TableHead>Mã lô</TableHead>
                      <TableHead>Ngày nhập</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Giá vốn</TableHead>
                      <TableHead className="text-right">Còn lại</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {imports.map((imp) => (
                      <TableRow key={imp.id} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-mono font-semibold">{imp.id}</TableCell>
                        <TableCell>{formatDate(imp.importDate)}</TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatNumber(imp.quantity)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatVND(imp.costPrice)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">
                          {formatNumber(imp.remainingQuantity)}
                        </TableCell>
                        <TableCell>
                          {imp.remainingQuantity === 0 ? (
                            <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                              Đã bán hết
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 font-medium">
                              Còn hàng
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales History */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Lịch sử Bán hàng (Sales History)
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Các đơn hàng đã xuất bán cho sản phẩm này
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {sales.length} đơn
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {sales.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="Chưa có lượt bán nào"
                  description="Chưa có đơn bán hàng nào phát sinh cho sản phẩm này."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/30">
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Ngày bán</TableHead>
                      <TableHead className="text-right">SL bán</TableHead>
                      <TableHead className="text-right">Giá bán</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                      <TableHead className="text-right">Lợi nhuận</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((s) => (
                      <TableRow key={s.id} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-mono font-semibold">{s.id}</TableCell>
                        <TableCell>{formatDate(s.soldDate)}</TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatNumber(s.quantity)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatVND(s.sellingPrice)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-foreground">
                          {formatVND(s.revenue)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          +{formatVND(s.profit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
