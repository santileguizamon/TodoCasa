import { apiFetch } from '../lib/api'

export function obtenerPerfilCliente() {
  return apiFetch('/users/me')
}

export function actualizarPerfilCliente(data: {
  id: number
  nombre: string
  telefono?: string
}) {
  return apiFetch(`/users/${data.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre: data.nombre,
      telefono: data.telefono,
    }),
  })
}
