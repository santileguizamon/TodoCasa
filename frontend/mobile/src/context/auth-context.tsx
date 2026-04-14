import { createContext, useContext, useEffect, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { AuthResponse } from '../auth/auth-types'
import { login as loginService } from '../auth/auth.service'
import { apiFetch } from '../lib/api'

interface AuthContextType {
  user: AuthResponse['user'] | null
  token: string | null
  login: (email: string, password: string) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<AuthResponse['user'] | null>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const storedToken = await SecureStore.getItemAsync('token')
      const storedUser = await SecureStore.getItemAsync('user')

      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser) as AuthResponse['user'])
      }

      setLoading(false)
    })()
  }, [])

  async function login(email: string, password: string) {
    try {
      const res = await loginService(email, password)
  
      setToken(res.access_token)
      setUser(res.user)
  
      await SecureStore.setItemAsync('token', res.access_token)
      await SecureStore.setItemAsync('refresh_token', res.refresh_token)
      await SecureStore.setItemAsync('user', JSON.stringify(res.user))
      return res
    } catch (error) {
      console.error('Login error', error)
      throw error
    }
  }

  async function logout() {
    setToken(null)
    setUser(null)
    await SecureStore.deleteItemAsync('token')
    await SecureStore.deleteItemAsync('refresh_token')
    await SecureStore.deleteItemAsync('user')
  }

  async function refreshUser() {
    const authToken = token ?? (await SecureStore.getItemAsync('token'))
    if (!authToken) return null

    const me = await apiFetch<any>('/users/me', {}, authToken)
    const nextUser: AuthResponse['user'] = {
      id: me.id,
      nombre: me.nombre,
      email: me.email,
      rol: me.rol,
      direccion: me.direccion ?? null,
      lat: me.lat ?? null,
      lng: me.lng ?? null,
    }

    setUser(nextUser)
    await SecureStore.setItemAsync('user', JSON.stringify(nextUser))
    return nextUser
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
