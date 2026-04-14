'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchAdminTrabajos } from '@/app/lib/admin/trabajos'

type TrabajoAdmin = {
  id: number
  titulo: string
  descripcion: string
  estado: string
  creadoEn: string
  rangoMin?: number
  rangoMax?: number
  cliente: {
    id: number
    nombre: string
  }
  chat?: {
    profesional?: {
      id: number
      nombre: string
    }
  } | null
}

const PAGE_SIZE = 10

function estadoClasses(estado: string) {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-amber-100 text-amber-700'
    case 'ASIGNADO':
      return 'bg-blue-100 text-blue-700'
    case 'PENDIENTE_CONFIRMACION':
      return 'bg-indigo-100 text-indigo-700'
    case 'FINALIZADO':
      return 'bg-emerald-100 text-emerald-700'
    case 'CANCELADO':
      return 'bg-rose-100 text-rose-700'
    case 'EN_RECLAMO':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function TrabajosAdminPage() {
  const [trabajos, setTrabajos] = useState<TrabajoAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<'TODOS' | string>('TODOS')
  const [page, setPage] = useState(1)

  const cargarTrabajos = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetchAdminTrabajos()
      setTrabajos(Array.isArray(res) ? res : [])
    } catch (e: any) {
      setTrabajos([])
      setError(e?.message ?? 'No se pudieron cargar los trabajos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarTrabajos()
  }, [])

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()
    return trabajos.filter((t) => {
      if (
        term &&
        !`${t.titulo} ${t.cliente?.nombre ?? ''} ${
          t.chat?.profesional?.nombre ?? ''
        }`
          .toLowerCase()
          .includes(term)
      ) {
        return false
      }
      if (estadoFilter !== 'TODOS' && t.estado !== estadoFilter) return false
      return true
    })
  }, [trabajos, search, estadoFilter])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginados = filtrados.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [search, estadoFilter])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
        Cargando trabajos...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          Administracion
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Trabajos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Seguimiento de publicaciones, estados y asignaciones.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo, cliente o profesional"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          />
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            <option value="TODOS">Estado: Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="PENDIENTE_CONFIRMACION">Pendiente confirmacion</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="EN_RECLAMO">En reclamo</option>
          </select>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al cargar trabajos: {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Titulo</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Profesional
                </th>
                <th className="px-4 py-3 text-left font-semibold">
                  Presupuesto
                </th>
                <th className="px-4 py-3 text-left font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginados.map((trabajo) => (
                <tr key={trabajo.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium">{trabajo.titulo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                        estadoClasses(trabajo.estado),
                      ].join(' ')}
                    >
                      {trabajo.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">{trabajo.cliente.nombre}</td>
                  <td className="px-4 py-3">
                    {trabajo.chat?.profesional?.nombre ?? 'Pendiente'}
                  </td>
                  <td className="px-4 py-3">
                    {typeof trabajo.rangoMin === 'number' &&
                    typeof trabajo.rangoMax === 'number'
                      ? `$${trabajo.rangoMin} - $${trabajo.rangoMax}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(trabajo.creadoEn).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!error && filtrados.length === 0 ? (
          <div className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
            No hay trabajos para mostrar con los filtros actuales.
          </div>
        ) : null}

        {!error && filtrados.length > 0 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>
              Pagina {pageSafe} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
                className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
                className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
