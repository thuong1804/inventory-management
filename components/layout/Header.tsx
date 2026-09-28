'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  MenuIcon,
  RotateCcwIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldCheckIcon,
  LogInIcon,
  UserPlusIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { storage } from '@/services/storage'
import { authService, UserSession } from '@/services/auth.service'
import { AuthDialog } from '@/components/auth/AuthDialog'
import { toast } from 'sonner'

interface HeaderProps {
  onOpenMobileMenu: () => void
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Tổng quan Dashboard',
    subtitle: 'Thống kê tình hình kinh doanh, doanh thu, lợi nhuận và kho hàng',
  },
  '/products': {
    title: 'Danh mục Sản phẩm',
    subtitle: 'Quản lý danh sách sản phẩm, tồn kho và trạng thái',
  },
  '/imports': {
    title: 'Quản lý Nhập hàng',
    subtitle: 'Theo dõi các phiếu nhập kho, giá vốn và lô hàng còn lại',
  },
  '/sales': {
    title: 'Quản lý Bán hàng',
    subtitle: 'Lập đơn bán, quản lý doanh thu, giá vốn và lợi nhuận từng đợt',
  },
  '/expenses': {
    title: 'Quản lý Chi phí',
    subtitle: 'Ghi nhận chi phí vận hành, đóng gói, marketing và vận chuyển',
  },
  '/reports': {
    title: 'Báo cáo & Phân tích',
    subtitle: 'Báo cáo doanh thu, chi phí, lợi nhuận ròng và giá trị kho',
  },
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

  const refreshUser = useCallback(() => {
    authService
      .getCurrentUser()
      .then((user) => {
        setCurrentUser(user)
      })
      .catch(() => setCurrentUser(null))
  }, [])

  useEffect(() => {
    refreshUser()
    window.addEventListener('inventory_auth_changed', refreshUser)
    return () => {
      window.removeEventListener('inventory_auth_changed', refreshUser)
    }
  }, [refreshUser])

  // Match title or check if product detail
  let currentMeta = PAGE_TITLES[pathname]
  if (!currentMeta && pathname.startsWith('/products/')) {
    currentMeta = {
      title: 'Chi tiết Sản phẩm',
      subtitle: 'Xem toàn bộ lịch sử nhập, xuất và hiệu quả kinh doanh của sản phẩm',
    }
  }
  if (!currentMeta) {
    currentMeta = {
      title: 'Quản lý Kho hàng',
      subtitle: 'Hệ thống quản lý hàng hoá và kinh doanh',
    }
  }

  const handleResetData = () => {
    storage.resetAll()
    toast.success('Đã khôi phục dữ liệu mẫu ban đầu thành công!')
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
      toast.info('Đã đăng xuất phiên làm việc thành công.')
      window.location.href = '/login'
    } catch {
      toast.error('Có lỗi xảy ra khi đăng xuất')
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenMobileMenu}
          className="lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="size-5" />
        </Button>

        <div>
          <h1 className="text-base font-semibold leading-none text-foreground sm:text-lg">
            {currentMeta.title}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block mt-1">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions & User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Mock Data button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetData}
          className="hidden md:inline-flex h-8 text-xs font-normal text-muted-foreground hover:text-foreground"
          title="Khôi phục lại dữ liệu mẫu"
        >
          <RotateCcwIcon className="mr-1.5 size-3.5" />
          Reset Demo Data
        </Button>

        {/* User profile / login button */}
        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 rounded-full p-1 pl-2 hover:bg-muted text-sm cursor-pointer"
                />
              }
            >
              <div className="hidden flex-col items-end text-right md:flex">
                <span className="text-xs font-medium text-foreground">
                  {currentUser.name || currentUser.email.split('@')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground">{currentUser.email}</span>
              </div>
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                {(currentUser.name || currentUser.email).slice(0, 2).toUpperCase()}
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-medium leading-none text-foreground">
                      {currentUser.name || currentUser.email.split('@')[0]}
                    </p>
                    <p className="text-[11px] leading-none text-muted-foreground">
                      {currentUser.email}
                    </p>
                    <p className="text-[10px] font-medium text-primary">
                      {currentUser.role || 'Quản trị viên'}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setAuthModalMode('login')
                    setAuthModalOpen(true)
                  }}
                  className="cursor-pointer text-xs"
                >
                  <LogInIcon className="mr-2 size-4 text-muted-foreground" />
                  <span>Đổi tài khoản đăng nhập</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setAuthModalMode('register')
                    setAuthModalOpen(true)
                  }}
                  className="cursor-pointer text-xs"
                >
                  <UserPlusIcon className="mr-2 size-4 text-muted-foreground" />
                  <span>Đăng ký thêm tài khoản</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOutIcon className="mr-2 size-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1.5">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setAuthModalMode('login')
                setAuthModalOpen(true)
              }}
              className="h-8 text-xs font-medium gap-1.5 shadow-xs"
            >
              <LogInIcon className="size-3.5" />
              Đăng nhập / Đăng ký
            </Button>
          </div>
        )}
      </div>

      {/* Auth Dialog (Login / Register Modal) */}
      <AuthDialog
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        initialMode={authModalMode}
        onSuccess={refreshUser}
      />
    </header>
  )
}
