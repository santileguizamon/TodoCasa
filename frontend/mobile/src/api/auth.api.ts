import { apiFetch } from '../lib/api'

export type AuthResponse = {
  accessToken: string
  user: {
    id: number
    nombre: string
    email: string
    rol: 'CLIENTE' | 'PROFESIONAL' | 'ADMIN'
  }
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

