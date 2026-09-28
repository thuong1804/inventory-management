'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BoxesIcon, LockIcon, MailIcon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        await authService.signUp(email, password)
        toast.success('Đăng ký tài khoản thành công! Vui lòng kiểm tra email hoặc đăng nhập.')
        setIsSignUp(false)
      } else {
        await authService.signIn(email, password)
        toast.success('Đăng nhập thành công!')
        window.location.href = '/'
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <BoxesIcon className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Inventory Pro
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp
              ? 'Tạo tài khoản mới để quản lý kho hàng'
              : 'Đăng nhập để truy cập hệ thống quản trị kho'}
          </p>
        </div>

        <Card className="border-border shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg">
                {isSignUp ? 'Đăng ký tài khoản' : 'Đăng nhập'}
              </CardTitle>
              <CardDescription>
                Nhập thông tin tài khoản Supabase của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Email</label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Mật khẩu</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
                {isSignUp ? 'Tạo tài khoản' : 'Đăng nhập'}
              </Button>

              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {isSignUp
                  ? 'Đã có tài khoản? Đăng nhập ngay'
                  : 'Chưa có tài khoản? Đăng ký ngay'}
              </button>

              {!isSignUp && (
                <div className="w-full pt-3 border-t border-border/60">
                  <p className="text-[11px] text-muted-foreground mb-2 text-center">
                    Hoặc đăng nhập nhanh bằng tài khoản mẫu:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setEmail('admin@inventory.vn')
                        setPassword('123456')
                        setLoading(true)
                        try {
                          await authService.signIn('admin@inventory.vn', '123456')
                          toast.success('Đăng nhập thành công với vai trò Admin!')
                          window.location.href = '/'
                        } catch (err: unknown) {
                          toast.error(err instanceof Error ? err.message : 'Lỗi đăng nhập')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      className="h-8 text-[11px] justify-center"
                      disabled={loading}
                    >
                      Admin
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setEmail('staff@inventory.vn')
                        setPassword('123456')
                        setLoading(true)
                        try {
                          await authService.signIn('staff@inventory.vn', '123456')
                          toast.success('Đăng nhập thành công với vai trò Nhân viên kho!')
                          window.location.href = '/'
                        } catch (err: unknown) {
                          toast.error(err instanceof Error ? err.message : 'Lỗi đăng nhập')
                        } finally {
                          setLoading(false)
                        }
                      }}
                      className="h-8 text-[11px] justify-center"
                      disabled={loading}
                    >
                      Nhân viên kho
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
