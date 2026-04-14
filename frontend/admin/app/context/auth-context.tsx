'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import Cookies from 'js-cookie'
import { apiFetch } from '../lib/api'

type AuthContextType = {
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const adminAuth = localStorage.getItem('admin-auth')
    if (token && adminAuth === 'true') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (!res?.user || res.user.rol !== 'ADMIN') {
      throw new Error('No autorizado')
    }

    localStorage.setItem('admin-auth', 'true')
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('refresh_token', res.refresh_token)
    localStorage.setItem('admin-user', JSON.stringify(res.user))
    Cookies.set('adminUser', String(res.user.id), { sameSite: 'Lax' })
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('admin-auth')
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('admin-user')
    Cookies.remove('adminUser')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
