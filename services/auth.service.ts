import { createClient } from '@/lib/supabase/client'

const AUTH_COOKIE_NAME = 'inventory_auth_user'
const isClient = typeof window !== 'undefined'

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  return (
    url.length > 0 &&
    !url.includes('your-project') &&
    key.length > 0 &&
    !key.includes('your-publishable')
  )
}

function setAuthCookie(email: string) {
  if (isClient) {
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(email)}; path=/; max-age=604800; SameSite=Lax`
    localStorage.setItem(AUTH_COOKIE_NAME, email)
    window.dispatchEvent(new Event('inventory_auth_changed'))
  }
}

function clearAuthCookie() {
  if (isClient) {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
    localStorage.removeItem(AUTH_COOKIE_NAME)
    window.dispatchEvent(new Event('inventory_auth_changed'))
  }
}

export interface UserSession {
  id: string
  email: string
  name?: string
  role?: string
}

export async function signIn(email: string, password: string): Promise<UserSession> {
  const trimmedEmail = email.trim()

  if (isSupabaseConfigured()) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user) {
      setAuthCookie(data.user.email || trimmedEmail)
      return {
        id: data.user.id,
        email: data.user.email || trimmedEmail,
        name: data.user.user_metadata?.name || trimmedEmail.split('@')[0],
      }
    }
  }

  // Fallback demo/local authentication when Supabase is not configured yet
  if (!password || password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự.')
  }

  setAuthCookie(trimmedEmail)
  return {
    id: `user-${Date.now()}`,
    email: trimmedEmail,
    name: trimmedEmail.split('@')[0],
    role: trimmedEmail.includes('admin') ? 'Quản trị viên' : 'Nhân viên kho',
  }
}

export async function signUp(email: string, password: string, name?: string): Promise<UserSession> {
  const trimmedEmail = email.trim()

  if (isSupabaseConfigured()) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { name: name || trimmedEmail.split('@')[0] },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user) {
      setAuthCookie(data.user.email || trimmedEmail)
      return {
        id: data.user.id,
        email: data.user.email || trimmedEmail,
        name: name || trimmedEmail.split('@')[0],
      }
    }
  }

  if (!password || password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự.')
  }

  setAuthCookie(trimmedEmail)
  return {
    id: `user-${Date.now()}`,
    email: trimmedEmail,
    name: name || trimmedEmail.split('@')[0],
    role: 'Nhân viên kho',
  }
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
  }

  clearAuthCookie()
}

export async function getCurrentUser(): Promise<UserSession | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          role: 'Quản trị viên',
        }
      }
    } catch {
      // fallback
    }
  }

  if (isClient) {
    const stored = localStorage.getItem(AUTH_COOKIE_NAME)
    if (stored) {
      return {
        id: 'local-user',
        email: stored,
        name: stored.split('@')[0],
        role: stored.includes('admin') ? 'Quản trị viên' : 'Nhân viên kho',
      }
    }
  }

  return null
}

export const authService = {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
}
