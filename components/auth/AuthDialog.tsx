'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/auth.service'
import {
  LockIcon,
  MailIcon,
  UserIcon,
  Loader2Icon,
  ShieldCheckIcon,
  BoxesIcon,
} from 'lucide-react'
import { toast } from 'sonner'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: 'login' | 'register'
  onSuccess?: () => void
}

export function AuthDialog({
  open,
  onOpenChange,
  initialMode = 'login',
  onSuccess,
}: AuthDialogProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Vui lòng điền đầy đủ email và mật khẩu')
      return
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp!')
        return
      }
      if (password.length < 6) {
        toast.error('Mật khẩu phải từ 6 ký tự trở lên')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'register') {
        await authService.signUp(email, password, name)
        toast.success('Đăng ký tài khoản thành công! Đã đăng nhập vào hệ thống.')
      } else {
        await authService.signIn(email, password)
        toast.success('Đăng nhập thành công!')
      }

      onOpenChange(false)
      if (onSuccess) onSuccess()
      window.location.href = '/'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xác thực không thành công'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('123456')
    setLoading(true)
    try {
      await authService.signIn(demoEmail, '123456')
      toast.success(`Đăng nhập thành công với vai trò ${demoEmail.split('@')[0]}!`)
      onOpenChange(false)
      if (onSuccess) onSuccess()
      window.location.href = '/'
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đăng nhập nhanh'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center sm:text-left">
          <div className="mx-auto sm:mx-0 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
            <BoxesIcon className="size-5" />
          </div>
          <DialogTitle className="text-xl">
            {mode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản mới'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {mode === 'login'
              ? 'Nhập tài khoản để quản lý kho hàng và xem báo cáo tài chính'
              : 'Tạo tài khoản quản trị kho hàng mới trong hệ thống'}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-muted p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-md py-1.5 font-medium transition-all ${
              mode === 'login'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-md py-1.5 font-medium transition-all ${
              mode === 'register'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Đăng ký tài khoản
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-3.5 mt-2">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Họ và tên</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email</label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="admin@inventory.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Mật khẩu</label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-9 text-xs"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Xác nhận mật khẩu</label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 h-9 text-xs"
                  required
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full h-9 text-xs font-medium mt-2" disabled={loading}>
            {loading && <Loader2Icon className="mr-2 size-3.5 animate-spin" />}
            {mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
          </Button>

          {/* Quick login helpers */}
          {mode === 'login' && (
            <div className="pt-2 border-t border-border/60">
              <p className="text-[11px] text-muted-foreground mb-2 text-center">
                Hoặc đăng nhập nhanh bằng tài khoản mẫu:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('admin@inventory.vn')}
                  className="h-8 text-[11px] justify-start px-2.5"
                  disabled={loading}
                >
                  <ShieldCheckIcon className="mr-1.5 size-3.5 text-primary" />
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('staff@inventory.vn')}
                  className="h-8 text-[11px] justify-start px-2.5"
                  disabled={loading}
                >
                  <UserIcon className="mr-1.5 size-3.5 text-muted-foreground" />
                  Nhân viên kho
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
