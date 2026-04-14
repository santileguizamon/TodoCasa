'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/auth-context'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/admin')
    }
  }, [loading, isAuthenticated, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Completa email y contrasena')
      return
    }

    try {
      setSubmitting(true)
      await login(email, password)
      router.replace('/admin')
    } catch {
      setError('Credenciales invalidas o sin permisos de admin')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || isAuthenticated) return null

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 50%, #dbeafe 100%)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 18px 45px rgba(2, 6, 23, 0.14)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '22px 24px 14px',
            borderBottom: '1px solid #eef2f7',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748b',
              fontWeight: 700,
            }}
          >
            Todocasa Admin
          </p>
          <h1
            style={{
              margin: '8px 0 0',
              fontSize: 24,
              fontWeight: 800,
              color: '#0f172a',
            }}
          >
            Iniciar sesion
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'grid', gap: 14, padding: 24 }}
        >
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
              Email
            </span>
            <input
              type="email"
              placeholder="admin@todocasa.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: '12px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                outline: 'none',
                color: '#0f172a',
                background: '#ffffff',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>
              Contrasena
            </span>
            <input
              type="password"
              placeholder="Tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '12px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                outline: 'none',
                color: '#0f172a',
                background: '#ffffff',
              }}
            />
          </label>

          {error ? (
            <p
              style={{
                margin: 0,
                color: '#b91c1c',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 4,
              padding: '12px 14px',
              borderRadius: 10,
              border: 'none',
              background: submitting ? '#94a3b8' : '#0f172a',
              color: '#ffffff',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Ingresando...' : 'Ingresar al panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
