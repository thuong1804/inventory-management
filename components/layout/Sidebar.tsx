'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboardIcon,
  PackageIcon,
  PackagePlusIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  BarChart3Icon,
  LayersIcon,
  XIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboardIcon,
  },
  {
    name: 'Sản phẩm (Products)',
    href: '/products',
    icon: PackageIcon,
  },
  {
    name: 'Nhập hàng (Import)',
    href: '/imports',
    icon: PackagePlusIcon,
  },
  {
    name: 'Bán hàng (Sales)',
    href: '/sales',
    icon: ShoppingCartIcon,
  },
  {
    name: 'Chi phí (Expenses)',
    href: '/expenses',
    icon: ReceiptIcon,
  },
  {
    name: 'Báo cáo (Reports)',
    href: '/reports',
    icon: BarChart3Icon,
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <LayersIcon className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight tracking-tight">KHO HÀNG PRO</span>
              <span className="text-[10px] text-muted-foreground font-normal">Inventory System</span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Quản lý kho
          </div>
          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon
                    className={cn(
                      'size-4.5 shrink-0 transition-colors',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom system status info */}
        <div className="border-t border-border p-3.5 m-2 rounded-xl bg-muted/40">
          <div className="flex items-center gap-2.5">
            <div className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">Hệ thống đang hoạt động</span>
              <span className="text-[11px] text-muted-foreground">Chế độ Mock Data (Supabase Ready)</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
