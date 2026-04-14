'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Badge from '@/app/admin/components/Badge'
import { fetchAdminTrabajos } from '@/app/lib/admin/trabajos'

type Trabajo = {
  id: number
  titulo: string
  descripcion: string
  estado: string
  urgente: boolean
  cliente: { id: number; nombre: string }
  ofertas: Array<{
    id: number
    monto: number
    profesional: {
      usuario: {
        id: number
        nombre: string
      }
    }
  }>
}

function mapEstadoColor(estado: string) {
  if (estado === 'PENDIENTE') return 'yellow'
  if (estado === 'ASIGNADO') return 'blue'
  if (estado === 'PENDIENTE_CONFIRMACION') return 'blue'
  if (estado === 'FINALIZADO') return 'green'
  if (estado === 'CANCELADO') return 'red'
  return 'gray'
}

export default function TrabajoDetallePage() {
  const params = useParams<{ id: string }>()
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminTrabajos()
      .then((list: Trabajo[]) => {
        const found = list.find((t) => String(t.id) === String(params.id))
        setTrabajo(found ?? null)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <p className="p-6">Cargando...</p>
  if (!trabajo) return <p className="p-6">Trabajo no encontrado</p>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{trabajo.titulo}</h1>

      <div className="border p-4 space-y-2">
        <p>
          <strong>Cliente:</strong> {trabajo.cliente.nombre}
        </p>
        <p>
          <strong>Estado:</strong>{' '}
          <Badge label={trabajo.estado} color={mapEstadoColor(trabajo.estado) as any} />
        </p>
        <p>
          <strong>Urgente:</strong>{' '}
          {trabajo.urgente ? <Badge label="URGENTE" color="red" /> : <Badge label="NORMAL" />}
        </p>
        <p>
          <strong>Descripcion:</strong> {trabajo.descripcion}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Ofertas</h2>
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Profesional</th>
              <th className="border p-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            {trabajo.ofertas.map((oferta) => (
              <tr key={oferta.id}>
                <td className="border p-2">{oferta.profesional.usuario.nombre}</td>
                <td className="border p-2">${oferta.monto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
