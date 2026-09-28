'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  DollarSignIcon,
  TrendingUpIcon,
  PackageIcon,
  BoxesIcon,
  ShoppingCartIcon,
  ArrowDownToLineIcon,
  WalletIcon,
  ScaleIcon,
} from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatCard } from '@/components/dashboard/StatCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { ProfitChart } from '@/components/dashboard/ProfitChart'
import { ProductSalesChart } from '@/components/dashboard/ProductSalesChart'
import { ExpenseChart } from '@/components/dashboard/ExpenseChart'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { dashboardService } from '@/services/dashboard.service'
import { DashboardStats } from '@/types/dashboard'
import { formatVND, formatNumber } from '@/lib/formatters'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalCost: 0,
    grossProfit: 0,
    netProfit: 0,
    totalProducts: 0,
    productsRemaining: 0,
    totalExpenses: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = useCallback(async () => {
    try {
      const data = await dashboardService.getStats()
      setStats(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()

    const handleUpdate = () => {
      loadStats()
    }
    window.addEventListener('inventory_storage_updated', handleUpdate)
    return () => window.removeEventListener('inventory_storage_updated', handleUpdate)
  }, [loadStats])

  return (
    <PageContainer
      title="Tổng quan Kinh doanh & Kho hàng"
      description="Chỉ số hiệu quả tài chính và số liệu vận hành kho hàng thời gian thực"
      actions={
        <>
          <Link
            href="/imports"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-8 gap-1.5 text-xs')}
          >
            <ArrowDownToLineIcon className="size-3.5" />
            Nhập kho
          </Link>

          <Link
            href="/sales"
            className={cn(buttonVariants({ size: 'sm' }), 'h-8 gap-1.5 text-xs')}
          >
            <ShoppingCartIcon className="size-3.5" />
            Tạo đơn bán
          </Link>
        </>
      }
    >
      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Doanh thu (Revenue)"
          value={isLoading ? '...' : formatVND(stats.totalRevenue)}
          subtext="Tổng tiền bán hàng"
          variant="success"
          icon={<DollarSignIcon className="size-5" />}
        />

        <StatCard
          title="Giá vốn (Cost)"
          value={isLoading ? '...' : formatVND(stats.totalCost)}
          subtext="Tổng vốn hàng đã bán"
          variant="warning"
          icon={<WalletIcon className="size-5" />}
        />

        <StatCard
          title="Lợi nhuận gộp"
          value={isLoading ? '...' : formatVND(stats.grossProfit)}
          subtext="Doanh thu - Giá vốn"
          variant="primary"
          icon={<TrendingUpIcon className="size-5" />}
        />

        <StatCard
          title="Lợi nhuận ròng"
          value={isLoading ? '...' : formatVND(stats.netProfit)}
          subtext="Sau khi trừ chi phí"
          variant="success"
          icon={<ScaleIcon className="size-5" />}
        />

        <StatCard
          title="Tổng mã hàng"
          value={isLoading ? '...' : `${formatNumber(stats.totalProducts)} SKU`}
          subtext="Sản phẩm trong danh mục"
          variant="info"
          icon={<PackageIcon className="size-5" />}
        />

        <StatCard
          title="Tồn kho còn lại"
          value={isLoading ? '...' : `${formatNumber(stats.productsRemaining)} chiếc`}
          subtext="Số lượng sẵn sàng bán"
          variant="default"
          icon={<BoxesIcon className="size-5" />}
        />
      </div>

      {/* Row 1: Revenue Line Chart (8 cols) & Profit Bar Chart (4 cols) */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <RevenueChart />
        <ProfitChart />
      </div>

      {/* Row 2: Top Selling Products (6 cols) & Expense Breakdown (6 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ProductSalesChart />
        <ExpenseChart />
      </div>
    </PageContainer>
  )
}
