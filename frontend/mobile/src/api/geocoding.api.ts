import { apiFetch } from '../lib/api'

type BuscarDireccionesOptions = {
  lat?: number | null
  lng?: number | null
  countryCode?: string
}

export async function buscarDirecciones(
  query: string,
  options: BuscarDireccionesOptions = {}
) {
  const text = query?.trim()
  if (!text || text.length < 3) return []

  const params = new URLSearchParams({ q: text })

  if (typeof options.lat === 'number') {
    params.append('lat', String(options.lat))
  }
  if (typeof options.lng === 'number') {
    params.append('lng', String(options.lng))
  }
  if (options.countryCode) {
    params.append('countryCode', options.countryCode)
  }

  return apiFetch(`/users/geocoding?${params.toString()}`)
}
