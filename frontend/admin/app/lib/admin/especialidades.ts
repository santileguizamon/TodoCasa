import { apiFetch } from '../api'

export function fetchAdminEspecialidades() {
  return apiFetch('/especialidades')
}

export function crearEspecialidadAdmin(nombre: string) {
  return apiFetch('/especialidades', {
    method: 'POST',
    body: JSON.stringify({ nombre }),
  })
}

export function actualizarEspecialidadAdmin(
  id: number,
  payload: { nombre?: string; activa?: boolean },
) {
  return apiFetch(`/especialidades/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
