'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/especialidades', label: 'Especialidades' },
  { href: '/admin/trabajos', label: 'Trabajos' },
  { href: '/admin/ofertas', label: 'Ofertas' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-72 border-r border-slate-200 bg-white/85 backdrop-blur">
      <div className="p-6 border-b border-slate-200">
        <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
          TodoCasa
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Admin</h1>
      </div>

      <nav className="p-4 space-y-2">
        {links.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'block rounded-xl px-4 py-3 text-sm font-medium transition',
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100',
              ].join(' ')}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

