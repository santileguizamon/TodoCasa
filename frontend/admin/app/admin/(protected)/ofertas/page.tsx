'use client'

import { useEffect, useMemo, useState } from 'react'
import { fetchAdminOfertas, rechazarOfertaAdmin } from '@/app/lib/admin/ofertas'

type OfertaAdmin = {
  id: number
  monto: number
  creadaEn: string
  trabajo: {
    id: number
    titulo: string
  }
  profesional: {
    usuario: {
      id: number
      nombre: string
      email: string
    }
  }
}

type Notice = {
  type: 'success' | 'error'
  message: string
} | null

const PAGE_SIZE = 10

export default function OfertasAdminPage() {
  const [ofertas, setOfertas] = useState<OfertaAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [rechazandoId, setRechazandoId] = useState<number | null>(null)

  const [search, setSearch] = useState('')
  const [montoMin, setMontoMin] = useState('')
  const [montoMax, setMontoMax] = useState('')
  const [page, setPage] = useState(1)

  const cargarOfertas = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetchAdminOfertas()
      setOfertas(Array.isArray(res) ? res : [])
    } catch (e: any) {
      setOfertas([])
      setError(e?.message ?? 'No se pudieron cargar las ofertas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarOfertas()
  }, [])

  const filtradas = useMemo(() => {
    const term = search.trim().toLowerCase()
    const min = montoMin === '' ? null : Number(montoMin)
    const max = montoMax === '' ? null : Number(montoMax)

    return ofertas.filter((o) => {
      if (
        term &&
        !`${o.trabajo.titulo} ${o.profesional.usuario.nombre} ${o.profesional.usuario.email}`
          .toLowerCase()
          .includes(term)
      ) {
        return false
      }
      if (min !== null && o.monto < min) return false
      if (max !== null && o.monto > max) return false
      return true
    })
  }, [ofertas, search, montoMin, montoMax])

  const totalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginadas = filtradas.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [search, montoMin, montoMax])

  const rechazarOferta = async (id: number) => {
    if (!confirm('Rechazar esta oferta?')) return

    try {
      setRechazandoId(id)
      await rechazarOfertaAdmin(id)
      setOfertas((prev) => prev.filter((o) => o.id !== id))
      setNotice({ type: 'success', message: 'Oferta rechazada correctamente' })
    } catch (e: any) {
      const message = e?.message ?? 'No se pudo rechazar la oferta'
      setError(message)
      setNotice({ type: 'error', message })
    } finally {
      setRechazandoId(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
        Cargando ofertas...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          Administracion
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Ofertas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Revision de ofertas realizadas por profesionales.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar trabajo, profesional o email"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          />
          <input
            value={montoMin}
            onChange={(e) => setMontoMin(e.target.value)}
            placeholder="Monto minimo"
            type="number"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          />
          <input
            value={montoMax}
            onChange={(e) => setMontoMax(e.target.value)}
            placeholder="Monto maximo"
            type="number"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          />
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error en ofertas: {error}
        </div>
      ) : null}

      {notice ? (
        <div
          className={[
            'rounded-xl px-4 py-3 text-sm',
            notice.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-red-200 bg-red-50 text-red-700',
          ].join(' ')}
        >
          {notice.message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Trabajo</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Profesional
                </th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Monto</th>
                <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginadas.map((oferta) => (
                <tr key={oferta.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium">
                    {oferta.trabajo.titulo}
                  </td>
                  <td className="px-4 py-3">{oferta.profesional.usuario.nombre}</td>
                  <td className="px-4 py-3">{oferta.profesional.usuario.email}</td>
                  <td className="px-4 py-3">${oferta.monto}</td>
                  <td className="px-4 py-3">
                    {new Date(oferta.creadaEn).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => rechazarOferta(oferta.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                      disabled={rechazandoId === oferta.id}
                    >
                      {rechazandoId === oferta.id ? 'Rechazando...' : 'Rechazar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!error && filtradas.length === 0 ? (
          <div className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
            No hay ofertas para mostrar con los filtros actuales.
          </div>
        ) : null}

        {!error && filtradas.length > 0 ? (
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
