'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'

type Usuario = {
  rol: 'CLIENTE' | 'PROFESIONAL' | 'ADMIN'
  verificado: boolean
  activo?: boolean
  createdAt?: string
  pagos?: Array<{
    estado: 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO'
  }>
}

type Trabajo = {
  estado?: string
  creadoEn?: string
}

type Oferta = {
  id: number
  monto?: number
}

// Estados de Trabajo según el schema de Prisma (EstadoTrabajo).
const ESTADOS_TRABAJO = [
  { key: 'PENDIENTE', label: 'Abierto', color: 'bg-blue-500' },
  { key: 'ASIGNADO', label: 'Asignado', color: 'bg-indigo-500' },
  { key: 'PENDIENTE_CONFIRMACION', label: 'Por confirmar', color: 'bg-amber-400' },
  { key: 'FINALIZADO', label: 'Finalizado', color: 'bg-emerald-500' },
  { key: 'CANCELADO', label: 'Cancelado', color: 'bg-slate-400' },
  { key: 'EN_RECLAMO', label: 'En reclamo', color: 'bg-red-500' },
] as const

const SEMANAS = 8
const MS_SEMANA = 7 * 24 * 60 * 60 * 1000

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    Promise.all([
      apiFetch('/admin/usuarios'),
      apiFetch('/admin/trabajos'),
      apiFetch('/admin/ofertas'),
    ])
      .then(([u, t, o]) => {
        if (!mounted) return
        setError(null)
        setUsuarios(Array.isArray(u) ? u : [])
        setTrabajos(Array.isArray(t) ? t : [])
        setOfertas(Array.isArray(o) ? o : [])
      })
      .catch((e: any) => {
        if (!mounted) return
        setError(e?.message ?? 'No se pudo cargar el dashboard')
        setUsuarios([])
        setTrabajos([])
        setOfertas([])
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  const datos = useMemo(() => {
    const profesionales = usuarios.filter((u) => u.rol === 'PROFESIONAL')
    const clientes = usuarios.filter((u) => u.rol === 'CLIENTE').length
    const pendientesVerificacion = profesionales.filter((u) => !u.verificado).length
    const suspendidos = usuarios.filter((u) => u.activo === false).length
    const suscripcionesPendientes = usuarios.filter(
      (u) => u.pagos?.[0]?.estado === 'PENDIENTE',
    ).length

    const porEstado = Object.fromEntries(
      ESTADOS_TRABAJO.map((e) => [
        e.key,
        trabajos.filter((t) => t.estado === e.key).length,
      ]),
    ) as Record<(typeof ESTADOS_TRABAJO)[number]['key'], number>

    const montos = ofertas
      .map((o) => o.monto)
      .filter((m): m is number => typeof m === 'number')
    const montoPromedio = montos.length
      ? montos.reduce((a, b) => a + b, 0) / montos.length
      : null

    // Actividad de las últimas SEMANAS semanas (la última es la semana en curso).
    const ahora = Date.now()
    const semanas = Array.from({ length: SEMANAS }, (_, i) => ({
      inicio: ahora - (SEMANAS - i) * MS_SEMANA,
      altas: 0,
      trabajos: 0,
    }))
    const indiceSemana = (fecha?: string) => {
      if (!fecha) return -1
      const t = new Date(fecha).getTime()
      if (Number.isNaN(t) || t > ahora) return -1
      return SEMANAS - 1 - Math.floor((ahora - t) / MS_SEMANA)
    }
    usuarios.forEach((u) => {
      const i = indiceSemana(u.createdAt)
      if (i >= 0) semanas[i].altas++
    })
    trabajos.forEach((t) => {
      const i = indiceSemana(t.creadoEn)
      if (i >= 0) semanas[i].trabajos++
    })

    return {
      totalUsuarios: usuarios.length,
      profesionales: profesionales.length,
      clientes,
      pendientesVerificacion,
      suspendidos,
      suscripcionesPendientes,
      porcentajeVerificados: profesionales.length
        ? Math.round(
            ((profesionales.length - pendientesVerificacion) / profesionales.length) * 100,
          )
        : null,
      totalTrabajos: trabajos.length,
      porEstado,
      totalOfertas: ofertas.length,
      ofertasPorTrabajo: trabajos.length ? ofertas.length / trabajos.length : null,
      montoPromedio,
      semanas,
    }
  }, [usuarios, trabajos, ofertas])

  const pendientes = [
    {
      label: 'Profesionales sin verificar',
      value: datos.pendientesVerificacion,
      href: '/admin/usuarios',
      accion: 'Revisar usuarios',
    },
    {
      label: 'Suscripciones pendientes',
      value: datos.suscripcionesPendientes,
      href: '/admin/usuarios',
      accion: 'Revisar pagos',
    },
    {
      label: 'Trabajos en reclamo',
      value: datos.porEstado.EN_RECLAMO,
      href: '/admin/trabajos',
      accion: 'Revisar trabajos',
      critico: true,
    },
  ]
  const totalPendientes = pendientes.reduce((a, p) => a + p.value, 0)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Resumen general
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Dashboard operativo
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Indicadores de estado para gestionar la operación diaria.
        </p>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error de carga: {error}
        </section>
      ) : null}

      {/* A. Requiere atención */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Requiere atención
          </h3>
          {!loading && !error && totalPendientes === 0 ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <CheckIcon className="h-3.5 w-3.5" />
              Todo al día
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-28" />)
            : pendientes.map((p) => {
                const activo = p.value > 0
                const tono = !activo
                  ? 'border-slate-200 bg-slate-50'
                  : p.critico
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                const numero = !activo
                  ? 'text-slate-400'
                  : p.critico
                    ? 'text-red-700'
                    : 'text-amber-700'
                return (
                  <Link
                    key={p.label}
                    href={p.href}
                    className={`group rounded-xl border px-5 py-4 transition hover:shadow-md ${tono}`}
                  >
                    <p className="text-sm text-slate-600">{p.label}</p>
                    <p className={`mt-1 text-3xl font-bold ${numero}`}>{p.value}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500 group-hover:text-blue-700">
                      {activo ? `${p.accion} →` : 'Sin pendientes'}
                    </p>
                  </Link>
                )
              })}
        </div>
      </section>

      {/* B. KPIs agrupados */}
      <section className="grid gap-4 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-52" />)
        ) : (
          <>
            <KpiGroup
              titulo="Usuarios"
              icono={<UsersIcon />}
              total={datos.totalUsuarios}
              totalLabel="usuarios totales"
              filas={[
                { label: 'Clientes', value: datos.clientes },
                { label: 'Profesionales', value: datos.profesionales },
                {
                  label: 'Profesionales verificados',
                  value:
                    datos.porcentajeVerificados === null
                      ? '—'
                      : `${datos.porcentajeVerificados}%`,
                },
                { label: 'Suspendidos', value: datos.suspendidos },
              ]}
            />
            <KpiGroup
              titulo="Trabajos"
              icono={<BriefcaseIcon />}
              total={datos.totalTrabajos}
              totalLabel="trabajos publicados"
              filas={[
                { label: 'Abiertos', value: datos.porEstado.PENDIENTE },
                { label: 'Finalizados', value: datos.porEstado.FINALIZADO },
                { label: 'Cancelados', value: datos.porEstado.CANCELADO },
                { label: 'En reclamo', value: datos.porEstado.EN_RECLAMO },
              ]}
            />
            <KpiGroup
              titulo="Ofertas"
              icono={<TagIcon />}
              total={datos.totalOfertas}
              totalLabel="ofertas registradas"
              filas={[
                {
                  label: 'Ofertas por trabajo',
                  value:
                    datos.ofertasPorTrabajo === null
                      ? '—'
                      : datos.ofertasPorTrabajo.toLocaleString('es-AR', {
                          maximumFractionDigits: 1,
                        }),
                },
                {
                  label: 'Monto promedio',
                  value:
                    datos.montoPromedio === null
                      ? '—'
                      : datos.montoPromedio.toLocaleString('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                          maximumFractionDigits: 0,
                        }),
                },
              ]}
            />
          </>
        )}
      </section>

      {/* C. Gráficos */}
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Trabajos por estado
          </h3>
          {loading ? (
            <Skeleton className="mt-4 h-24" />
          ) : datos.totalTrabajos === 0 ? (
            <EmptyState texto="Todavía no hay trabajos publicados." />
          ) : (
            <>
              <div className="mt-5 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                {ESTADOS_TRABAJO.map((e) => {
                  const n = datos.porEstado[e.key]
                  if (!n) return null
                  return (
                    <div
                      key={e.key}
                      className={e.color}
                      style={{ width: `${(n / datos.totalTrabajos) * 100}%` }}
                      title={`${e.label}: ${n}`}
                    />
                  )
                })}
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                {ESTADOS_TRABAJO.map((e) => {
                  const n = datos.porEstado[e.key]
                  return (
                    <li key={e.key} className="flex items-center gap-2 text-sm">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${e.color}`} />
                      <span className="text-slate-600">{e.label}</span>
                      <span className="ml-auto font-semibold text-slate-900">{n}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Actividad de las últimas {SEMANAS} semanas
            </h3>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" /> Altas de usuarios
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Trabajos publicados
              </span>
            </div>
          </div>
          {loading ? (
            <Skeleton className="mt-4 h-40" />
          ) : datos.semanas.every((s) => s.altas === 0 && s.trabajos === 0) ? (
            <EmptyState texto="Sin actividad en las últimas semanas." />
          ) : (
            <ActividadSemanal semanas={datos.semanas} />
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Acciones rápidas
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <QuickLink href="/admin/usuarios" title="Gestionar usuarios" />
          <QuickLink href="/admin/trabajos" title="Revisar trabajos" />
          <QuickLink href="/admin/ofertas" title="Auditar ofertas" />
        </div>
      </section>
    </div>
  )
}

function ActividadSemanal({
  semanas,
}: {
  semanas: Array<{ inicio: number; altas: number; trabajos: number }>
}) {
  const max = Math.max(1, ...semanas.flatMap((s) => [s.altas, s.trabajos]))
  const fecha = (t: number) =>
    new Date(t).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
  return (
    <div className="mt-5">
      <div className="flex h-40 items-end gap-2 border-b border-slate-200">
        {semanas.map((s) => (
          <div
            key={s.inicio}
            className="flex h-full flex-1 items-end justify-center gap-1"
            title={`Semana desde ${fecha(s.inicio)}: ${s.altas} altas, ${s.trabajos} trabajos`}
          >
            <div
              className="w-full max-w-4 rounded-t bg-blue-500"
              style={{ height: `${(s.altas / max) * 100}%` }}
            />
            <div
              className="w-full max-w-4 rounded-t bg-amber-400"
              style={{ height: `${(s.trabajos / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-2">
        {semanas.map((s, i) => (
          <p key={s.inicio} className="flex-1 text-center text-[10px] text-slate-400">
            {i === semanas.length - 1 ? 'Actual' : fecha(s.inicio)}
          </p>
        ))}
      </div>
    </div>
  )
}

function KpiGroup({
  titulo,
  icono,
  total,
  totalLabel,
  filas,
}: {
  titulo: string
  icono: React.ReactNode
  total: number
  totalLabel: string
  filas: Array<{ label: string; value: number | string }>
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icono}
        </span>
        <h3 className="font-semibold text-slate-900">{titulo}</h3>
      </div>
      <p className="mt-4 text-4xl font-bold text-slate-900">{total}</p>
      <p className="text-sm text-slate-500">{totalLabel}</p>
      <dl className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
        {filas.map((f) => (
          <div key={f.label} className="flex items-center justify-between py-2 text-sm">
            <dt className="text-slate-600">{f.label}</dt>
            <dd className="font-semibold text-slate-900">{f.value}</dd>
          </div>
        ))}
      </dl>
    </article>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-slate-200 bg-slate-100 ${className}`}
    />
  )
}

function EmptyState({ texto }: { texto: string }) {
  return (
    <div className="mt-4 flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
      {texto}
    </div>
  )
}

function QuickLink({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100"
    >
      {title}
    </Link>
  )
}

const iconProps = {
  viewBox: '0 0 24 24',
  className: 'h-5 w-5',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function UsersIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 10 3.5 3.5L15 6.5" />
    </svg>
  )
}
