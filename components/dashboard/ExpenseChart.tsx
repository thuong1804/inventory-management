'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { dashboardService } from '@/services/dashboard.service'
import { ExpenseByCategory } from '@/types/dashboard'
import { formatVND } from '@/lib/formatters'

const CATEGORY_COLORS: Record<string, string> = {
  Shipping: '#06b6d4',
  Packaging: '#f59e0b',
  Marketing: '#ec4899',
  Operation: '#6366f1',
  Other: '#64748b',
}

const CATEGORY_NAMES_VN: Record<string, string> = {
  Shipping: 'Vận chuyển (Shipping)',
  Packaging: 'Đóng gói (Packaging)',
  Marketing: 'Marketing & Quảng cáo',
  Operation: 'Vận hành kho bãi',
  Other: 'Chi phí khác',
}

export function ExpenseChart() {
  const [categories, setCategories] = useState<ExpenseByCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const res = await dashboardService.getExpensesByCategory()
      setCategories(res)
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

  const totalExpense = categories.reduce((acc, c) => acc + c.amount, 0)

  return (
    <Card className="col-span-full lg:col-span-6 shadow-xs border-border/80">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Cơ cấu Chi phí theo Danh mục
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Phân bổ các khoản chi phí vận hành, marketing và đóng gói
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 font-mono">
            {formatVND(totalExpense)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="h-[280px] w-full">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Đang tải biểu đồ chi phí...
            </div>
          ) : categories.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Chưa ghi nhận chi phí nào
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(val: unknown) => [
                    `${formatVND(Number(val))} (${((Number(val) / totalExpense) * 100).toFixed(1)}%)`,
                    'Chi phí',
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--popover-foreground)',
                  }}
                />
                <Legend
                  formatter={(value) => CATEGORY_NAMES_VN[value] || value}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Pie
                  data={categories}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {categories.map((entry) => (
                    <Cell
                      key={`cell-${entry.category}`}
                      fill={CATEGORY_COLORS[entry.category] || '#94a3b8'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* List of categories with amounts */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {categories.map((c) => (
            <div
              key={c.category}
              className="flex items-center justify-between rounded-md bg-muted/40 p-2"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[c.category] || '#94a3b8' }}
                />
                <span className="font-medium text-foreground truncate">
                  {c.category}
                </span>
              </div>
              <span className="font-semibold text-muted-foreground font-mono ml-2">
                {c.percentage}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
