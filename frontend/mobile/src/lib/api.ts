import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL as string | undefined)
  console.log("API_URL USADA:", API_URL);
let refreshPromise: Promise<string | null> | null = null

function headersToRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {}
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries())
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers)
  }
  return headers as Record<string, string>
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = await SecureStore.getItemAsync('refresh_token')
    const userRaw = await SecureStore.getItemAsync('user')
    if (!refreshToken || !userRaw) return null

    const user = JSON.parse(userRaw) as { id?: number }
    if (!user?.id) return null

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        refresh_token: refreshToken,
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!data?.access_token) return null

    await SecureStore.setItemAsync('token', data.access_token)
    if (data.refresh_token) {
      await SecureStore.setItemAsync('refresh_token', data.refresh_token)
    }

    return data.access_token as string
  })()

  const token = await refreshPromise
  refreshPromise = null
  return token
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.status === 204) return null as T
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return (await res.text()) as T
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  if (!API_URL) {
    throw new Error(
      'Falta EXPO_PUBLIC_API_URL en .env o app.json > extra',
    )
  }

  const storedToken = await SecureStore.getItemAsync('token')
  const authToken = token ?? storedToken ?? undefined
  const customHeaders = headersToRecord(options.headers)
  const isFormData = options.body instanceof FormData

  const headers: Record<string, string> = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...customHeaders,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }

  const exec = (bearer?: string) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
    })

  let res: Response
  try {
    res = await exec()
  } catch {
    throw new Error(`Network request failed: ${API_URL}${path}`)
  }

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      res = await exec(refreshed)
    }
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'API error')
  }

  return parseResponse<T>(res)
}
