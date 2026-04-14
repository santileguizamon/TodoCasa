import { apiFetch } from '../lib/api'

export function obtenerProfesional(id: number) {
  return apiFetch(`/profesionales/${id}`)
}

export function actualizarDescripcionProfesional(
  _id: number,
  descripcion: string
) {
  return apiFetch('/profesionales/me/perfil', {
    method: 'PATCH',
    body: JSON.stringify({ descripcion }),
  })
}

export function obtenerMiPerfilProfesional() {
  return apiFetch('/profesionales/me')
}

export function obtenerEspecialidades() {
  return apiFetch('/especialidades')
}

export function actualizarPerfilProfesional(
  data: {
    descripcion?: string
    id_especialidades?: number[]
  },
  token?: string
) {
  return apiFetch(
    '/profesionales/me/perfil',
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
    token
  );
}
