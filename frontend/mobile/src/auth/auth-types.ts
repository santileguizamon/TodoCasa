import { Rol } from '../types/rol'

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: number
    nombre: string
    email: string
    rol: Rol
    direccion?: string | null
    lat?: number | null
    lng?: number | null
  }
}

