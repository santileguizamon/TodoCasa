import {apiFetch} from '../lib/api' // o tu instancia axios

export const actualizarUbicacion = (
  lat: number,
  lng: number,
  token?: string
) =>
  apiFetch(
    '/users/ubicacion',
    {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    },
    token
  )

export const actualizarDireccion = (
  direccion: string,
  token?: string
) =>
  apiFetch(
    '/users/direccion',
    {
      method: 'PATCH',
      body: JSON.stringify({ direccion}),
    },
    token
  )

export function actualizarUsuario(
  id: number,
  data: {
    nombre?: string
    email?: string
    telefono?: string
    password?: string
  },
  token?: string
) {
  return apiFetch(
    `/users/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    token
  )
}  

export function subirFotoPerfil(
  formData: FormData,
  token?: string
) {
  return apiFetch(
    '/users/foto',
    {
      method: 'POST',
      body: formData,
      headers: {
        // IMPORTANTE: NO poner Content-Type manualmente
        // porque FormData lo setea automáticamente
      },
    },
    token
  )
}

