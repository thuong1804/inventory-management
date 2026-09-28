'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { dashboardService } from '@/services/dashboard.service'
import { TimeRangeFilter, RevenueChartPoint } from '@/types/dashboard'
import { formatVND } from '@/lib/formatters'
import { CalendarIcon } from 'lucide-react'

export function RevenueChart() {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('this_month')
  const [customStart, setCustomStart] = useState<string>('2026-01-01')
  const [customEnd, setCustomEnd] = useState<string>('2026-03-31')
  const [chartData, setChartData] = useState<RevenueChartPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const data = await dashboardService.getRevenueChartData(
        timeRange,
        customStart,
        customEnd
      )
      setChartData(data)
    } finally {
      setIsLoading(false)
    }
  }, [timeRange, customStart, customEnd])

  useEffect(() => {
    loadData()

    const handleUpdate = () => {
      loadData()
    }
    window.addEventListener('inventory_storage_updated', handleUpdate)
    return () => window.removeEventListener('inventory_storage_updated', handleUpdate)
  }, [loadData])

  const timeFilterButtons: { label: string; value: TimeRangeFilter }[] = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Tuần này', value: 'this_week' },
    { label: 'Tháng này', value: 'this_month' },
    { label: 'Tháng trước', value: 'last_month' },
    { label: 'Tùy chỉnh', value: 'custom' },
  ]

  return (
    <Card className="col-span-full xl:col-span-8 shadow-xs border-border/80">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/50">
        <div>
          <CardTitle className="text-base font-semibold">
            Biểu đồ Doanh thu & Chi phí vốn
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Theo dõi diễn biến doanh thu bán hàng và giá vốn theo dòng thời gian
          </p>
        </div>

        {/* Time filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
          {timeFilterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={timeRange === btn.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(btn.value)}
              className="h-7 text-xs px-2.5 rounded-md font-medium"
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {timeRange === 'custom' && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-muted/30 p-2.5 text-xs border border-border/60">
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">Khoảng thời gian:</span>
            <Input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-7 w-36 text-xs bg-background"
            />
            <span className="text-muted-foreground">đến</span>
            <Input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-7 w-36 text-xs bg-background"
            />
          </div>
        )}

        <div className="h-[320px] w-full">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Đang tải biểu đồ...
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Không có dữ liệu phát sinh trong khoảng thời gian này
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
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
                  labelFormatter={(lbl) => `Ngày: ${lbl}`}
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
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Doanh thu"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="Giá vốn (Cost)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
