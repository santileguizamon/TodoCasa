'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  fetchAdminEspecialidades,
  crearEspecialidadAdmin,
  actualizarEspecialidadAdmin,
} from '@/app/lib/admin/especialidades'

type Especialidad = {
  id: number
  nombre: string
  activa: boolean
}

const PAGE_SIZE = 12

type Notice = {
  type: 'success' | 'error'
  message: string
} | null

export default function EspecialidadesAdminPage() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<'TODAS' | 'ACTIVAS' | 'INACTIVAS'>('TODAS')
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('')
  const [guardandoNueva, setGuardandoNueva] = useState(false)
  const [actualizandoId, setActualizandoId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const cargarEspecialidades = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await fetchAdminEspecialidades()
      setEspecialidades(Array.isArray(res) ? res : [])
    } catch (e: any) {
      setEspecialidades([])
      setError(e?.message ?? 'No se pudieron cargar las especialidades')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEspecialidades()
  }, [])

  const filtradas = useMemo(() => {
    const term = search.trim().toLowerCase()
    return especialidades.filter((e) => {
      if (term && !e.nombre.toLowerCase().includes(term)) return false
      if (estadoFilter === 'ACTIVAS' && !e.activa) return false
      if (estadoFilter === 'INACTIVAS' && e.activa) return false
      return true
    })
  }, [especialidades, search, estadoFilter])

  const totalPages = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginadas = filtradas.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search, estadoFilter])

  const crear = async () => {
    const nombre = nuevaEspecialidad.trim()
    if (!nombre) return

    try {
      setGuardandoNueva(true)
      await crearEspecialidadAdmin(nombre)
      setNotice({ type: 'success', message: 'Especialidad creada correctamente' })
      setNuevaEspecialidad('')
      await cargarEspecialidades()
    } catch (e: any) {
      setNotice({
        type: 'error',
        message: e?.message ?? 'No se pudo crear la especialidad',
      })
    } finally {
      setGuardandoNueva(false)
    }
  }

  const toggleActiva = async (esp: Especialidad) => {
    const accion = esp.activa ? 'deshabilitar' : 'habilitar'
    if (!confirm(`${accion[0].toUpperCase()}${accion.slice(1)} especialidad "${esp.nombre}"?`)) {
      return
    }

    try {
      setActualizandoId(esp.id)
      await actualizarEspecialidadAdmin(esp.id, { activa: !esp.activa })
      setNotice({
        type: 'success',
        message: `Especialidad ${esp.activa ? 'deshabilitada' : 'habilitada'} correctamente`,
      })
      await cargarEspecialidades()
    } catch (e: any) {
      setNotice({
        type: 'error',
        message: e?.message ?? 'No se pudo actualizar la especialidad',
      })
    } finally {
      setActualizandoId(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
        Cargando especialidades...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Administracion</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Especialidades</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gestiona especialidades que luego podran seleccionar los profesionales.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar especialidad"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          />
          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            <option value="TODAS">Estado: Todas</option>
            <option value="ACTIVAS">Activas</option>
            <option value="INACTIVAS">Inactivas</option>
          </select>
          <div className="flex gap-2">
            <input
              value={nuevaEspecialidad}
              onChange={(e) => setNuevaEspecialidad(e.target.value)}
              placeholder="Nueva especialidad"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            />
            <button
              onClick={crear}
              disabled={guardandoNueva}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {guardandoNueva ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error: {error}
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
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginadas.map((esp) => (
                <tr key={esp.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium">{esp.nombre}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                        esp.activa
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700',
                      ].join(' ')}
                    >
                      {esp.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActiva(esp)}
                      disabled={actualizandoId === esp.id}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      {actualizandoId === esp.id
                        ? 'Actualizando...'
                        : esp.activa
                          ? 'Deshabilitar'
                          : 'Habilitar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!error && filtradas.length === 0 ? (
          <div className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
            No hay especialidades para mostrar.
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
