import { apiFetch } from '../lib/api'

export function obtenerOfertasPorTrabajo(trabajoId: number) {
  return apiFetch(`/ofertas/trabajo/${trabajoId}`,{
    method: 'GET',
  })
}

export function crearOferta(payload: {
  trabajoId: number
  monto: number
}) {
  return apiFetch('/ofertas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function aceptarOferta(ofertaId: number) {
  return apiFetch(`/ofertas/${ofertaId}/aceptar`, {
    method: 'POST',
  })
}

export function obtenerMiOfertaPorTrabajo(
  trabajoId: number
) {
  return apiFetch(`/ofertas/mi-oferta/${trabajoId}`,{
    method: 'GET',
  })
}
