import { apiFetch } from '../lib/api'

export async function iniciarPago(token: string) {
  return apiFetch(
    '/pagos',
    {
      method: 'POST',
      body: JSON.stringify({
        tipo: 'SUSCRIPCION',
        monto: 10000,
      }),
    },
    token,
  )

 
}

export async function obtenerMiSuscripcion(token: string) {
  return apiFetch('/suscripciones/mi-suscripcion', {}, token)
}

