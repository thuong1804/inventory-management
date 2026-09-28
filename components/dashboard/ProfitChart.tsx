'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { dashboardService } from '@/services/dashboard.service'
import { RevenueChartPoint } from '@/types/dashboard'
import { formatVND } from '@/lib/formatters'

export function ProfitChart() {
  const [data, setData] = useState<RevenueChartPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await dashboardService.getRevenueChartData('this_month')
      setData(res)
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
    <Card className="col-span-full xl:col-span-4 shadow-xs border-border/80">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-semibold">
          Lợi nhuận Gộp & Lợi nhuận Ròng
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          So sánh Gross Profit (Doanh thu - Giá vốn) và Net Profit (sau khi trừ Chi phí)
        </p>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="h-[320px] w-full">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Đang tải biểu đồ lợi nhuận...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-15" />
                <XAxis
                  dataKey="label"
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  className="text-muted-foreground"
                />
                <Tooltip
                  formatter={(val: unknown) => [formatVND(Number(val)), '']}
                  labelFormatter={(lbl) => `Thời gian: ${lbl}`}
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--popover-foreground)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar
                  dataKey="grossProfit"
                  name="Lợi nhuận gộp"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="netProfit"
                  name="Lợi nhuận ròng"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
