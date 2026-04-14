'use client'

import { useAuth } from '@/app/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import Sidebar from '@/app/admin/components/Sidebar'
import Header from '@/app/admin/components/header'

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, loading, router])

  if (loading || !isAuthenticated) return null

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}


