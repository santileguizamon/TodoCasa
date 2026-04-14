import { apiFetch } from '../lib/api'

export function crearValoracion(data: {
  trabajoId: number
  puntaje: number // 1 a 5
  comentario?: string
}) {
  return apiFetch('/valoraciones', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function obtenerValoracionesPorProfesional(profesionalId: number) {
  return apiFetch(`/valoraciones/profesional/${profesionalId}`)
}

export function obtenerPromedioProfesional(profesionalId: number) {
  return apiFetch(`/valoraciones/profesional/${profesionalId}/promedio`)
}


