import Link from 'next/link'
import {
  IlustracionControl,
  IlustracionHero,
  IlustracionMantenimiento,
  IlustracionProfesionales,
  LogoCasa,
} from './components/ilustraciones'

const servicios = [
  {
    titulo: 'Mantenimiento del hogar',
    Ilustracion: IlustracionMantenimiento,
    texto:
      'Solicitudes para arreglos, instalaciones y tareas de soporte con seguimiento de punta a punta.',
  },
  {
    titulo: 'Servicios profesionales',
    Ilustracion: IlustracionProfesionales,
    texto:
      'Red de profesionales habilitados para cotizar, coordinar y ejecutar trabajos de forma trazable.',
  },
  {
    titulo: 'Operación y control',
    Ilustracion: IlustracionControl,
    texto:
      'Monitoreo administrativo de usuarios, suscripciones y actividad para sostener la calidad del servicio.',
  },
]

const pasos = [
  {
    titulo: 'Publicación',
    texto: 'El cliente publica su necesidad con detalle y rango de presupuesto.',
  },
  {
    titulo: 'Ofertas',
    texto: 'Profesionales cercanos presentan ofertas dentro del rango definido.',
  },
  {
    titulo: 'Coordinación',
    texto: 'El cliente elige una propuesta y se habilita la coordinación por chat.',
  },
  {
    titulo: 'Cierre',
    texto: 'Se ejecuta el trabajo, se confirma la finalización y queda el registro.',
  },
]

const crecimientoProfesional = [
  {
    titulo: 'Más visibilidad local',
    icono: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    texto:
      'El perfil profesional aparece frente a clientes que publican trabajos dentro de su zona de cobertura.',
  },
  {
    titulo: 'Mayor volumen de trabajo',
    icono: 'M4 19V9 M10 19V5 M16 19v-7 M22 19H2',
    texto:
      'Con actividad sostenida, cada profesional puede mantener un flujo mensual de trabajos más estable y previsible.',
  },
  {
    titulo: 'Relación directa con clientes',
    icono: 'M4 5h16v11H9l-5 4V5Z M8 10h8 M8 13h5',
    texto:
      'El chat integrado simplifica la coordinación y acelera el paso de la oferta a la ejecución.',
  },
  {
    titulo: 'Reputación acumulativa',
    icono: 'm12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.3 6.8 19.1l1-5.8L3.5 9.2l5.9-.8Z',
    texto:
      'Cada trabajo finalizado fortalece el historial profesional y genera confianza para futuras contrataciones.',
  },
]

const rasgos = [
  'Profesionales verificados',
  'Ofertas dentro de tu presupuesto',
  'Chat en tiempo real',
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl px-6">
          <header className="flex items-center justify-between py-6">
            <div className="flex items-center gap-2.5">
              <LogoCasa className="h-9 w-9" />
              <span className="text-xl font-bold tracking-tight">TodoCasa</span>
            </div>
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-blue-700">
              Servicios del hogar
            </span>
          </header>

          <div className="grid items-center gap-10 pb-16 pt-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24 lg:pt-12">
            <article>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                Clientes y profesionales, en un solo lugar
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
                Gestión integral de trabajos para el{' '}
                <span className="text-blue-600">hogar</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                TodoCasa ordena el ciclo completo de una solicitud de trabajo:
                publicación, oferta, selección, comunicación y cierre. Diseñado
                para operar con claridad, control y trazabilidad.
              </p>

              <ul className="mt-8 flex flex-wrap gap-3">
                {rasgos.map((rasgo) => (
                  <li
                    key={rasgo}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
                  >
                    <svg viewBox="0 0 20 20" className="h-4 w-4 text-green-600" aria-hidden="true">
                      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
                      <path d="m6 10 3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {rasgo}
                  </li>
                ))}
              </ul>
            </article>

            <IlustracionHero className="mx-auto w-full max-w-md lg:max-w-none" />
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <SectionTitle
            eyebrow="Qué ofrece la plataforma"
            title="Áreas de servicio"
          />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {servicios.map(({ titulo, texto, Ilustracion }) => (
              <article
                key={titulo}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <Ilustracion className="h-44 w-full transition duration-300 group-hover:scale-[1.03]" />
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {texto}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-blue-50/60">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <SectionTitle eyebrow="Flujo de trabajo" title="Cómo funciona" />

          <ol className="relative mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
            <div
              className="absolute left-5 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] bg-blue-200 md:block"
              aria-hidden="true"
            />
            {pasos.map((paso, index) => (
              <li key={paso.titulo} className="relative">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white ring-8 ring-blue-50">
                  {index + 1}
                </span>
                <h3 className="mt-5 font-semibold">{paso.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {paso.texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CRECIMIENTO PROFESIONAL */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <SectionTitle
            eyebrow="Crecimiento profesional"
            title="Oportunidades para ampliar tu clientela"
            dark
          />
          <p className="mt-4 max-w-3xl text-slate-300">
            TodoCasa ofrece herramientas para que cada profesional aumente su
            exposición, sostenga un flujo mensual de trabajos y consolide una
            base de clientes recurrentes.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {crecimientoProfesional.map((item) => (
              <article
                key={item.titulo}
                className="flex gap-4 rounded-2xl border border-slate-700/70 bg-slate-800/60 p-6 transition hover:border-blue-500/60 hover:bg-slate-800"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                    <path d={item.icono} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <h3 className="font-semibold">{item.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {item.texto}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LogoCasa className="h-6 w-6" />
            <p className="text-xs text-slate-400">
              TodoCasa · Plataforma de gestión de servicios del hogar
            </p>
          </div>
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

function SectionTitle({
  eyebrow,
  title,
  dark = false,
}: {
  eyebrow: string
  title: string
  dark?: boolean
}) {
  return (
    <div>
      <p
        className={`text-xs font-semibold uppercase tracking-[0.18em] ${dark ? 'text-blue-300' : 'text-blue-700'}`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
    </div>
  )
}
