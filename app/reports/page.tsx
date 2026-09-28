'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FileSpreadsheetIcon, PrinterIcon } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { reportService, ReportSummary } from '@/services/report.service'
import { formatVND, formatDate, formatNumber } from '@/lib/formatters'
import { toast } from 'sonner'

export default function ReportsPage() {
  const [data, setData] = useState<ReportSummary | null>(null)
  const [activeTab, setActiveTab] = useState<'revenue' | 'cost' | 'profit' | 'inventory'>('revenue')
  const [isLoading, setIsLoading] = useState(true)

  const loadReports = useCallback(async () => {
    try {
      const summary = await reportService.getFullReports()
      setData(summary)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()

    const handleUpdate = () => {
      loadReports()
    }
    window.addEventListener('inventory_storage_updated', handleUpdate)
    return () => window.removeEventListener('inventory_storage_updated', handleUpdate)
  }, [loadReports])

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    toast.success('Báo cáo đã sẵn sàng để in hoặc xuất PDF!')
  }

  if (isLoading || !data) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Đang tổng hợp báo cáo kinh doanh...
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Báo cáo & Phân tích Tài chính Kho"
      description="Hệ thống báo cáo chi tiết doanh thu, giá vốn, lợi nhuận gộp, lợi nhuận ròng và định giá hàng tồn kho"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs"
          >
            <PrinterIcon className="size-3.5" />
            In báo cáo
          </Button>
          <Button
            size="sm"
            onClick={handleExportCSV}
            className="h-8 gap-1.5 text-xs"
          >
            <FileSpreadsheetIcon className="size-3.5" />
            Xuất dữ liệu
          </Button>
        </div>
      }
    >
      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-xs border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tổng doanh thu bán hàng
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatVND(data.profitReport.totalRevenue)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total Revenue</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tổng giá vốn bán ra
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatVND(data.costReport.totalCost)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Cost of Goods Sold (COGS)</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs border-l-4 border-l-primary">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Lợi nhuận ròng (Net Profit)
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-primary">
              {formatVND(data.profitReport.netProfit)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Gross ({formatVND(data.profitReport.grossProfit)}) - CP ({formatVND(data.profitReport.totalExpenses)})
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Định giá tồn kho (Valuation)
            </p>
            <p className="mt-2 text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
              {formatVND(data.inventoryReport.totalInventoryValue)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Tổng số lượng tồn: {formatNumber(data.inventoryReport.remainingQuantity)} chiếc
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs Navigation */}
      <div className="flex border-b border-border/70 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'revenue'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          1. Báo cáo Doanh thu (Revenue)
        </button>

        <button
          onClick={() => setActiveTab('cost')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'cost'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          2. Báo cáo Chi phí & Giá vốn (Cost)
        </button>

        <button
          onClick={() => setActiveTab('profit')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profit'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          3. Báo cáo Lợi nhuận (P&L Profit)
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          4. Báo cáo Tồn kho & Định giá (Inventory)
        </button>
      </div>

      {/* TAB 1: REVENUE REPORT */}
      {activeTab === 'revenue' && (
        <div className="space-y-6 animate-in fade-in-50">
          {/* Revenue by Product */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-semibold">
                Doanh thu & Lợi nhuận theo Từng Sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/30">
                      <TableHead>Mã SKU</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead className="text-right">Đã nhập</TableHead>
                      <TableHead className="text-right">Đã bán</TableHead>
                      <TableHead className="text-right">Còn tồn</TableHead>
                      <TableHead className="text-right">Tổng Doanh thu</TableHead>
                      <TableHead className="text-right">Giá vốn</TableHead>
                      <TableHead className="text-right">Lợi nhuận gộp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.revenueReport.byProduct.map((p) => (
                      <TableRow key={p.productId} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-mono font-medium">{p.sku}</TableCell>
                        <TableCell className="font-medium text-foreground">{p.productName}</TableCell>
                        <TableCell className="text-muted-foreground">{p.category}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(p.importedQty)}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{formatNumber(p.soldQty)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">{formatNumber(p.remainingQty)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">{formatVND(p.revenue)}</TableCell>
                        <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">{formatVND(p.cost)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">+{formatVND(p.profit)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Month & Day */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Doanh thu theo Tháng</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/30">
                      <TableHead>Tháng</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                      <TableHead className="text-right">Giá vốn</TableHead>
                      <TableHead className="text-right">Lợi nhuận gộp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.revenueReport.byMonth.map((m) => (
                      <TableRow key={m.month} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-mono font-semibold">{m.month}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{formatVND(m.revenue)}</TableCell>
                        <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400">{formatVND(m.cost)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">+{formatVND(m.profit)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Doanh thu theo Ngày</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/30">
                      <TableHead>Ngày</TableHead>
                      <TableHead className="text-right">Số đơn</TableHead>
                      <TableHead className="text-right">Doanh thu</TableHead>
                      <TableHead className="text-right">Lợi nhuận</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.revenueReport.byDay.slice(0, 8).map((d) => (
                      <TableRow key={d.date} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-mono">{formatDate(d.date)}</TableCell>
                        <TableCell className="text-right font-mono">{d.ordersCount}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{formatVND(d.revenue)}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">+{formatVND(d.profit)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: COST REPORT */}
      {activeTab === 'cost' && (
        <div className="space-y-6 animate-in fade-in-50">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Giá vốn theo Sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/30">
                      <TableHead>SKU</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead className="text-right">Tổng giá vốn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.costReport.costByProduct.map((cp) => (
                      <TableRow key={cp.sku} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-mono font-semibold">{cp.sku}</TableCell>
                        <TableCell>{cp.productName}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          {formatVND(cp.cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-semibold">Giá vốn xuất kho theo Tháng</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/30">
                      <TableHead>Tháng</TableHead>
                      <TableHead className="text-right">Tổng vốn đã xuất</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.costReport.costByMonth.map((cm) => (
                      <TableRow key={cm.month} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-mono font-semibold">{cm.month}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          {formatVND(cm.cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: PROFIT REPORT */}
      {activeTab === 'profit' && (
        <div className="space-y-6 animate-in fade-in-50">
          <Card className="border-border/80 shadow-xs max-w-3xl mx-auto">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-base font-semibold">
                Bảng Báo cáo Kết quả Hoạt động Kinh doanh (P&L Statement)
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Áp dụng công thức chuẩn: Lợi nhuận gộp = Doanh thu - Giá vốn; Lợi nhuận ròng = Lợi nhuận gộp - Chi phí vận hành
              </p>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="divide-y divide-border/70 text-sm">
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-foreground">1. Tổng Doanh thu bán hàng (Revenue)</span>
                  <span className="font-mono font-bold text-foreground">
                    {formatVND(data.profitReport.totalRevenue)}
                  </span>
                </div>

                <div className="flex justify-between py-3 text-muted-foreground">
                  <span>2. Giá vốn hàng bán (Cost of Goods Sold - COGS)</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    - {formatVND(data.profitReport.totalCost)}
                  </span>
                </div>

                <div className="flex justify-between py-3 bg-muted/30 px-3 rounded-lg">
                  <span className="font-bold text-foreground">
                    3. LỢI NHUẬN GỘP (Gross Profit = [1] - [2])
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatVND(data.profitReport.grossProfit)}
                  </span>
                </div>

                <div className="flex justify-between py-3 text-muted-foreground">
                  <span>4. Tổng chi phí phát sinh (Expenses: Vận chuyển, Bao bì, Marketing...)</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400">
                    - {formatVND(data.profitReport.totalExpenses)}
                  </span>
                </div>

                <div className="flex justify-between py-4 bg-primary/10 px-3 rounded-lg border border-primary/20">
                  <span className="font-bold text-base text-primary">
                    5. LỢI NHUẬN RÒNG (Net Profit = [3] - [4])
                  </span>
                  <span className="font-mono font-bold text-lg text-primary">
                    {formatVND(data.profitReport.netProfit)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                <p>
                  Tỷ suất lợi nhuận ròng / Doanh thu:{' '}
                  <span className="font-bold text-foreground font-mono">
                    {data.profitReport.totalRevenue > 0
                      ? `${((data.profitReport.netProfit / data.profitReport.totalRevenue) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: INVENTORY REPORT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in-50">
          {/* Inventory Valuation Table */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Định giá Hàng tồn kho theo Sản phẩm
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Giá trị tồn kho tính theo giá vốn thực tế của các lô hàng còn tồn
                  </p>
                </div>
                <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 font-mono">
                  Tổng giá trị: {formatVND(data.inventoryReport.totalInventoryValue)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs bg-muted/30">
                      <TableHead>Mã SKU</TableHead>
                      <TableHead>Tên sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng tồn kho</TableHead>
                      <TableHead className="text-right">Giá trị tồn kho ước tính</TableHead>
                      <TableHead>Tình trạng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.inventoryReport.items.map((item) => (
                      <TableRow key={item.productId} className="text-xs hover:bg-muted/20">
                        <TableCell className="font-mono font-medium">{item.sku}</TableCell>
                        <TableCell className="font-medium text-foreground">{item.productName}</TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">
                          {formatNumber(item.remainingQuantity)} chiếc
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {formatVND(item.estimatedValue)}
                        </TableCell>
                        <TableCell>
                          {item.remainingQuantity === 0 ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Hết hàng
                            </Badge>
                          ) : item.remainingQuantity <= 5 ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 text-[10px]">
                              Sắp hết
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                              Tồn kho an toàn
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}
