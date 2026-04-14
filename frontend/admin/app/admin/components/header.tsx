'use client'

import { useAuth } from '@/app/context/auth-context'
import { usePathname, useRouter } from 'next/navigation'

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/usuarios': 'Gestion de usuarios',
  '/admin/especialidades': 'Gestion de especialidades',
  '/admin/trabajos': 'Control de trabajos',
  '/admin/ofertas': 'Revision de ofertas',
}

export default function Header() {
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const title = titles[pathname] ?? 'Panel de administracion'

  const handleLogout = () => {
    logout()
    router.replace('/')
  }

  return (
    <header className="h-20 border-b border-slate-200 bg-white/70 backdrop-blur px-6 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          Panel de administracion
        </p>
        <strong className="text-lg text-slate-900">{title}</strong>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Cerrar sesion
      </button>
    </header>
  )
}
