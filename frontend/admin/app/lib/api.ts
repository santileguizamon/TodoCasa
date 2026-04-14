const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    const adminUser = localStorage.getItem('admin-user')

    if (!refreshToken || !adminUser) return null

    let userId: number | null = null
    try {
      const parsed = JSON.parse(adminUser) as { id?: number }
      userId = typeof parsed?.id === 'number' ? parsed.id : null
    } catch {
      userId = null
    }

    if (!userId) return null

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        refresh_token: refreshToken,
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!data?.access_token) return null

    localStorage.setItem('token', data.access_token)
    if (data?.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }

    return data.access_token as string
  })()

  const token = await refreshPromise
  refreshPromise = null
  return token
}

async function parseError(res: Response): Promise<Error> {
  const raw = await res.text().catch(() => '')
  let message = `Error ${res.status} en la API`

  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      message = parsed?.message || message
    } catch {
      message = raw
    }
  }

  return new Error(message)
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');
  const makeRequest = (bearer?: string) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...(options.headers || {}),
      },
    })

  let res = await makeRequest(token ?? undefined)

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      res = await makeRequest(refreshed)
    }
  }

  if (!res.ok) {
    throw await parseError(res)
  }
  if (res.status === 204) return null
  return res.json();
}
