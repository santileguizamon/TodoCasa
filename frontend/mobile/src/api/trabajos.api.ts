import { apiFetch } from '../lib/api'


interface ObtenerTrabajosParams {
  lat?: number
  lng?: number
  radio?: number
  categoria?: string | null
  urgente?: boolean
}

export function obtenerTrabajosDisponibles({
  lat,
  lng,
  radio = 10,
  categoria,
  urgente,
}: ObtenerTrabajosParams) {
  const params = new URLSearchParams()

  if (lat != null && lng != null) {
    params.append('lat', String(lat))
    params.append('lng', String(lng))
    params.append('radioKm', String(radio))
  }

  if (categoria) {
    params.append('categoria', categoria)
  }

  if (urgente) {
    params.append('urgente', 'true')
  }

  const query = params.toString()
  const url = '/trabajos' + (query ? `?${query}` : '')

  return apiFetch(url)
}

export function obtenerTrabajo(id: number) {
  return apiFetch(`/trabajos/${id}`)
}

export function crearTrabajo(payload: {
  titulo: string
  descripcion: string
  categoria?: string
  rangoMin: number
  rangoMax: number
  urgente: boolean
  clienteId: number
  direccion?: string
  lat?: number
  lng?: number
}) {
  return apiFetch('/trabajos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function obtenerTrabajosAsignados() {
  return apiFetch('/trabajos/profesional/mis-trabajos')
}

export function finalizarTrabajo(trabajoId: number) {
  return apiFetch(`/trabajos/${trabajoId}/finalizar`, {
    method: 'PATCH',
  })
}

export function obtenerMisTrabajosProfesional (){
  return apiFetch('/trabajos/profesional/mis-trabajos')
}

export function obtenerMisTrabajosCliente() {
  return apiFetch('/trabajos/cliente/mis-trabajos')
}

export function eliminarTrabajo(id: number) {
  return apiFetch(`/trabajos/${id}`, {
    method: 'DELETE',
  })
}

export function definirFechaAcordada(
  trabajoId: number,
  fecha: Date
) {
  return apiFetch(`/trabajos/${trabajoId}/fecha-acordada`, {
    method: 'PATCH',
    body: JSON.stringify({ fecha: fecha.toISOString() }),
  })
}

