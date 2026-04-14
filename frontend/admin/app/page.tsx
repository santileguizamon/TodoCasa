import Link from 'next/link'

const servicios = [
  {
    titulo: 'Mantenimiento del hogar',
    imagen:
      'https://images.pexels.com/photos/8486972/pexels-photo-8486972.jpeg?auto=compress&cs=tinysrgb&w=1200',
    texto:
      'Solicitudes para arreglos, instalaciones y tareas de soporte con seguimiento de punta a punta.',
  },
  {
    titulo: 'Servicios profesionales',
    imagen:
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80',
    texto:
      'Red de profesionales habilitados para cotizar, coordinar y ejecutar trabajos de forma trazable.',
  },
  {
    titulo: 'Operacion y control',
    imagen:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    texto:
      'Monitoreo administrativo de usuarios, suscripciones y actividad para sostener calidad de servicio.',
  },
]

const pasos = [
  'El cliente publica su necesidad con detalle y rango de presupuesto.',
  'Profesionales cercanos presentan ofertas dentro del rango definido.',
  'El cliente elige una propuesta y se habilita la coordinacion por chat.',
  'Se ejecuta el trabajo, se confirma finalizacion y queda registro operativo.',
]

const crecimientoProfesional = [
  {
    titulo: 'Mas visibilidad local',
    texto:
      'El perfil profesional aparece frente a clientes que publican trabajos dentro de su zona de cobertura.',
  },
  {
    titulo: 'Mayor volumen operativo',
    texto:
      'Con actividad sostenida, los profesionales suelen mantener una media mensual de trabajos mas estable y previsible.',
  },
  {
    titulo: 'Relacion directa con clientes',
    texto:
      'El chat integrado simplifica la coordinacion y acelera conversiones desde la oferta hasta la ejecucion.',
  },
  {
    titulo: 'Reputacion acumulativa',
    texto:
      'Cada trabajo finalizado fortalece el historial profesional y mejora la confianza para futuras contrataciones.',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(186,230,253,0.7),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(191,219,254,0.65),transparent_40%),linear-gradient(180deg,#f0f9ff_0%,#dbeafe_100%)]" />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-16">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-700">
                Plataforma institucional
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
                TodoCasa
              </h1>
            </div>
            <div className="rounded-full border border-blue-300 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-blue-700">
              Servicios del hogar
            </div>
          </header>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <article>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                Gestion integral entre clientes y profesionales en una sola
                plataforma.
              </h2>
              <p className="mt-5 max-w-2xl text-base text-slate-700">
                TodoCasa estructura el ciclo completo de una solicitud de
                trabajo: publicacion, oferta, seleccion, comunicacion y cierre.
                Disenado para operar con claridad, control y trazabilidad.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Metric value="+200" label="Trabajos mensuales" />
                <Metric value="95%" label="Asignacion efectiva" />
                <Metric value="24/7" label="Disponibilidad" />
              </div>
            </article>

            <aside className="rounded-2xl border border-blue-200 bg-white/85 p-6 shadow-xl">
              <div className="overflow-hidden rounded-xl border border-blue-100">
                <img
                  src="https://images.pexels.com/photos/699459/pexels-photo-699459.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Persona usando la aplicacion desde el celular"
                  className="h-32 w-full object-cover"
                />
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">
                Enfoque operativo
              </p>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                <li className="rounded-lg bg-blue-50 px-3 py-2">
                  Estandarizacion del flujo de atencion
                </li>
                <li className="rounded-lg bg-blue-50 px-3 py-2">
                  Seguimiento de estados en tiempo real
                </li>
                <li className="rounded-lg bg-blue-50 px-3 py-2">
                  Herramientas administrativas de control
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#eef6ff_0%,#dbeafe_100%)] text-slate-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-blue-700">
                Que ofrece la plataforma
              </p>
              <h3 className="mt-2 text-3xl font-bold">Areas de servicio</h3>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {servicios.map((item) => (
              <article
                key={item.titulo}
                className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/60 to-blue-100/70 p-6 shadow-[0_14px_32px_rgba(29,78,216,0.18)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_24px_44px_rgba(37,99,235,0.30)]"
              >
                <div className="mb-4 overflow-hidden rounded-xl border border-blue-100">
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="h-28 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-200/80 blur-2xl transition group-hover:bg-blue-300/90" />
                <h4 className="text-lg font-semibold">{item.titulo}</h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {item.texto}
                </p>
                <div className="mt-4 h-1.5 w-10 rounded-full bg-blue-400 transition group-hover:w-16 group-hover:bg-blue-500" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-blue-100 to-blue-50 text-slate-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <p className="text-xs uppercase tracking-[0.16em] text-blue-700">
            Crecimiento profesional
          </p>
          <h3 className="mt-2 text-3xl font-bold">
            Oportunidades para ampliar clientela
          </h3>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            TodoCasa ofrece herramientas para que cada profesional incremente su
            exposicion, sostenga un flujo mensual de trabajos y consolide una
            base de clientes recurrentes.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {crecimientoProfesional.map((item) => (
              <article
                key={item.titulo}
                className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-[0_12px_28px_rgba(37,99,235,0.16)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_22px_42px_rgba(37,99,235,0.28)]"
              >
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-200/80 blur-2xl transition group-hover:bg-blue-300/90" />
                <h4 className="relative text-lg font-semibold">{item.titulo}</h4>
                <p className="relative mt-3 text-sm text-slate-600">
                  {item.texto}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-blue-50 to-sky-50 text-slate-900">
        <div className="mx-auto w-full max-w-6xl px-6 py-14">
          <p className="text-xs uppercase tracking-[0.16em] text-blue-700">
            Flujo de trabajo
          </p>
          <h3 className="mt-2 text-3xl font-bold">Como funciona</h3>

          <ol className="mt-7 grid gap-5 md:grid-cols-2">
            {pasos.map((paso, index) => (
              <li
                key={paso}
                className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white via-sky-50/80 to-blue-100/60 p-5 shadow-[0_12px_28px_rgba(14,116,144,0.14)] transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_22px_40px_rgba(14,116,144,0.26)]"
              >
                <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-sky-200/85 blur-2xl transition group-hover:bg-blue-300/95" />
                <p className="relative text-xs font-semibold uppercase tracking-[0.12em] text-blue-800">
                  Paso {index + 1}
                </p>
                <p className="relative mt-2 text-sm text-slate-700">{paso}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <p className="text-xs text-slate-500">
            TodoCasa - Plataforma de gestion de servicios del hogar
          </p>
          <Link
            href="/admin/login"
            className="text-[11px] uppercase tracking-[0.14em] text-slate-600 hover:text-slate-400"
          >
            acceso interno
          </Link>
        </div>
      </footer>
    </main>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-white/80 px-4 py-3 shadow-sm">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
    </div>
  )
}
