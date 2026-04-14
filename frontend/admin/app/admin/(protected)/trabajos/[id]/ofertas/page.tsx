'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiFetch } from '@/app/lib/api'
import { rechazarOfertaAdmin } from '@/app/lib/admin/ofertas'

type Oferta = {
  id: number
  monto: number
  profesional: {
    usuario: {
      nombre: string
      email: string
    }
  }
}

export default function OfertasTrabajoPage() {
  const params = useParams<{ id: string }>()
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`/ofertas/trabajo/${params.id}`)
      .then((res: Oferta[]) => setOfertas(Array.isArray(res) ? res : []))
      .finally(() => setLoading(false))
  }, [params.id])

  const rechazarOferta = async (ofertaId: number) => {
    if (!confirm('Rechazar esta oferta?')) return
    await rechazarOfertaAdmin(ofertaId)
    setOfertas((prev) => prev.filter((o) => o.id !== ofertaId))
  }

  if (loading) return <p>Cargando ofertas...</p>

  return (
    <div>
      <h2 className="text-lg font-bold">Ofertas del trabajo #{params.id}</h2>

      <table className="mt-4 border w-full">
        <thead>
          <tr>
            <th>Profesional</th>
            <th>Email</th>
            <th>Monto</th>
            <th>Acciones (Admin)</th>
          </tr>
        </thead>
        <tbody>
          {ofertas.map((oferta) => (
            <tr key={oferta.id}>
              <td>{oferta.profesional.usuario.nombre}</td>
              <td>{oferta.profesional.usuario.email}</td>
              <td>${oferta.monto}</td>
              <td>
                <button
                  onClick={() => rechazarOferta(oferta.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Rechazar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
