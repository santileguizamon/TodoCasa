'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/app/lib/api'

type Usuario = {
  rol: 'CLIENTE' | 'PROFESIONAL' | 'ADMIN'
  verificado: boolean
  pagos?: Array<{
    estado: 'PENDIENTE' | 'COMPLETADO' | 'FALLIDO'
  }>
}

type Trabajo = {
  estado?: string
}

type Oferta = {
  id: number
}

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

  const metrics = useMemo(() => {
    const profesionales = usuarios.filter((u) => u.rol === 'PROFESIONAL').length
    const clientes = usuarios.filter((u) => u.rol === 'CLIENTE').length
    const pendientesVerificacion = usuarios.filter(
      (u) => u.rol === 'PROFESIONAL' && !u.verificado,
    ).length
    const suscripcionesPendientes = usuarios.filter(
      (u) => u.pagos?.[0]?.estado === 'PENDIENTE',
    ).length

    const trabajosAbiertos = trabajos.filter((t) => t.estado === 'PENDIENTE').length
    const trabajosEnReclamo = trabajos.filter(
      (t) => t.estado === 'EN_RECLAMO',
    ).length
    const trabajosCancelados = trabajos.filter(
      (t) => t.estado === 'CANCELADO',
    ).length

    return [
      { label: 'Usuarios totales', value: usuarios.length },
      { label: 'Profesionales', value: profesionales },
      { label: 'Clientes', value: clientes },
      { label: 'Pendientes verificacion', value: pendientesVerificacion },
      { label: 'Suscripciones pendientes', value: suscripcionesPendientes },
      { label: 'Trabajos abiertos', value: trabajosAbiertos },
      { label: 'Trabajos en reclamo', value: trabajosEnReclamo },
      { label: 'Trabajos cancelados', value: trabajosCancelados },
      { label: 'Ofertas registradas', value: ofertas.length },
    ]
  }, [usuarios, trabajos, ofertas])

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
          Indicadores de estado para gestionar la operacion diaria.
        </p>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error de carga: {error}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 9 }).map((_, idx) => (
              <div
                key={idx}
                className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))
          : metrics.map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {item.value}
                </p>
              </article>
            ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Acciones rapidas
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
