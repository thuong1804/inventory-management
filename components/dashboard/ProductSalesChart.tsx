'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { dashboardService } from '@/services/dashboard.service'
import { TopSellingProduct } from '@/types/dashboard'
import { formatNumber, formatVND } from '@/lib/formatters'

export function ProductSalesChart() {
  const [products, setProducts] = useState<TopSellingProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await dashboardService.getTopSellingProducts(5)
      setProducts(res)
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

  return (
    <Card className="col-span-full lg:col-span-6 shadow-xs border-border/80">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold">
          Top Sản phẩm Bán chạy nhất
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Xếp hạng theo số lượng đã bán và doanh thu mang lại
        </p>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="h-[280px] w-full">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Đang tải sản phẩm bán chạy...
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Chưa có dữ liệu bán hàng
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={products}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="opacity-15" />
                <XAxis
                  type="number"
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  type="category"
                  dataKey="sku"
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                  className="text-muted-foreground font-mono"
                />
                <Tooltip
                  formatter={(val: unknown, name: unknown) => [
                    name === 'soldQuantity' ? `${formatNumber(Number(val))} chiếc` : formatVND(Number(val)),
                    name === 'soldQuantity' ? 'Đã bán' : 'Doanh thu',
                  ]}
                  labelFormatter={(_label, payload) => {
                    const item = payload?.[0]?.payload
                    return item ? `${item.productName} (${item.sku})` : ''
                  }}
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--popover-foreground)',
                  }}
                />
                <Bar
                  dataKey="soldQuantity"
                  name="soldQuantity"
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick summary table below chart */}
        <div className="mt-4 divide-y divide-border/60">
          {products.slice(0, 3).map((p, idx) => (
            <div key={p.productId} className="flex items-center justify-between py-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-muted font-bold text-[10px] text-muted-foreground">
                  {idx + 1}
                </span>
                <span className="font-medium text-foreground truncate max-w-[180px] sm:max-w-[240px]">
                  {p.productName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-medium">{formatNumber(p.soldQuantity)} cái</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatVND(p.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
