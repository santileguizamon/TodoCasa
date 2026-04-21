'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/app/lib/api'

type UsuarioAdmin = {
  id: number
  nombre: string
  email: string
  telefono?: string
  rol: 'CLIENTE' | 'PROFESIONAL' | 'ADMIN'
  activo?: boolean
  verificado: boolean
  suscripcion?: {
    nivel: string
    activa: boolean
  }
  pagos?: Array<{
    id: number
    estado: 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO'
    monto: number
    creadoEn: string
    referenciaMP?: string | null
  }>
}

const PAGE_SIZE = 10

type Notice = {
  type: 'success' | 'error'
  message: string
} | null

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [confirmandoPagoId, setConfirmandoPagoId] = useState<number | null>(
    null,
  )

  const [search, setSearch] = useState('')
  const [rolFilter, setRolFilter] = useState<'TODOS' | UsuarioAdmin['rol']>(
    'TODOS',
  )
  const [estadoFilter, setEstadoFilter] = useState<
    'TODOS' | 'ACTIVO' | 'SUSPENDIDO'
  >('TODOS')
  const [suscripcionFilter, setSuscripcionFilter] = useState<
    'TODAS' | 'ACTIVA' | 'PENDIENTE' | 'SIN'
  >('TODAS')
  const [page, setPage] = useState(1)

  const cargarUsuarios = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await apiFetch('/admin/usuarios')
      setUsuarios(Array.isArray(res) ? res : [])
    } catch (e: any) {
      setUsuarios([])
      setError(e?.message ?? 'No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase()

    return usuarios.filter((u) => {
      const isActive = u.activo ?? true

      if (
        term &&
        !`${u.nombre} ${u.email}`.toLowerCase().includes(term)
      ) {
        return false
      }
      if (rolFilter !== 'TODOS' && u.rol !== rolFilter) return false
      if (estadoFilter === 'ACTIVO' && !isActive) return false
      if (estadoFilter === 'SUSPENDIDO' && isActive) return false

      const pending =
        u.pagos?.[0]?.estado === 'PENDIENTE' &&
        !!u.pagos?.[0]?.referenciaMP
      const active = !!u.suscripcion?.activa

      if (suscripcionFilter === 'ACTIVA' && !active) return false
      if (suscripcionFilter === 'PENDIENTE' && !pending) return false
      if (suscripcionFilter === 'SIN' && (active || pending)) return false

      return true
    })
  }, [usuarios, search, rolFilter, estadoFilter, suscripcionFilter])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginados = filtrados.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE,
  )

  useEffect(() => {
    setPage(1)
  }, [search, rolFilter, estadoFilter, suscripcionFilter])

  const suspender = async (id: number) => {
    if (!confirm('Suspender este usuario?')) return

    try {
      await apiFetch(`/admin/usuarios/${id}/suspender`, {
        method: 'PATCH',
        body: JSON.stringify({ motivo: 'Suspension administrativa' }),
      })
      setNotice({ type: 'success', message: 'Usuario suspendido correctamente' })
      await cargarUsuarios()
    } catch (e: any) {
      setNotice({
        type: 'error',
        message: e?.message ?? 'No se pudo suspender el usuario',
      })
    }
  }

  const reactivar = async (id: number) => {
    if (!confirm('Reactivar este usuario?')) return

    try {
      await apiFetch(`/admin/usuarios/${id}/reactivar`, {
        method: 'PATCH',
      })
      setNotice({ type: 'success', message: 'Usuario reactivado correctamente' })
      await cargarUsuarios()
    } catch (e: any) {
      setNotice({
        type: 'error',
        message: e?.message ?? 'No se pudo reactivar el usuario',
      })
    }
  }

  const habilitarSuscripcion = async (pagoId: number) => {
    if (!confirm('Confirmar pago pendiente y activar suscripcion?')) return

    try {
      setConfirmandoPagoId(pagoId)
      await apiFetch(`/pagos/${pagoId}/confirmar`, {
        method: 'POST',
      })
      setNotice({
        type: 'success',
        message: 'Suscripcion activada correctamente',
      })
      await cargarUsuarios()
    } catch (e: any) {
      setNotice({
        type: 'error',
        message: e?.message ?? 'No se pudo activar la suscripcion',
      })
    } finally {
      setConfirmandoPagoId(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
        Cargando usuarios...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          Administracion
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gestion de cuentas, estado y suscripciones pendientes.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          />

          <select
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            <option value="TODOS">Rol: Todos</option>
            <option value="CLIENTE">Cliente</option>
            <option value="PROFESIONAL">Profesional</option>
            <option value="ADMIN">Admin</option>
          </select>

          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            <option value="TODOS">Estado: Todos</option>
            <option value="ACTIVO">Activos</option>
            <option value="SUSPENDIDO">Suspendidos</option>
          </select>

          <select
            value={suscripcionFilter}
            onChange={(e) => setSuscripcionFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
          >
            <option value="TODAS">Suscripcion: Todas</option>
            <option value="ACTIVA">Activa</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="SIN">Sin suscripcion</option>
          </select>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al cargar usuarios: {error}
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
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Rol</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Suscripcion
                </th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginados.map((u) => {
                const isActive = u.activo ?? true
                const pagoSuscripcion = u.pagos?.[0]
                const tienePagoPendiente =
                  pagoSuscripcion?.estado === 'PENDIENTE' &&
                  !!pagoSuscripcion?.referenciaMP

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium">{u.nombre}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.rol}</td>
                    <td className="px-4 py-3">
                      {u.suscripcion?.nivel ??
                        (tienePagoPendiente ? 'Pendiente' : '-')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700',
                        ].join(' ')}
                      >
                        {isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {isActive ? (
                          <button
                            onClick={() => suspender(u.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Suspender
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivar(u.id)}
                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            Reactivar
                          </button>
                        )}

                        {tienePagoPendiente ? (
                          <button
                            onClick={() =>
                              habilitarSuscripcion(pagoSuscripcion.id)
                            }
                            className="text-blue-600 hover:text-blue-700 font-medium"
                            disabled={confirmandoPagoId === pagoSuscripcion.id}
                          >
                            {confirmandoPagoId === pagoSuscripcion.id
                              ? 'Habilitando...'
                              : 'Habilitar suscripcion'}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!error && filtrados.length === 0 ? (
          <div className="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500">
            No hay usuarios para mostrar con los filtros actuales.
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
