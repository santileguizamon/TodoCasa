import { io } from 'socket.io-client';
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { refreshAccessToken } from './api'

const SOCKET_URL =
  process.env.EXPO_PUBLIC_WS_URL ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_WS_URL as string | undefined) ||
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL as string | undefined) ||
  '';

// El servidor exige el JWT al conectar. El token se lee en cada (re)conexión,
// así se usa siempre el último token guardado (también después de un refresh).
export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
  auth: (cb: (data: object) => void) => {
    SecureStore.getItemAsync('token')
      .then((token) => cb({ token }))
      .catch(() => cb({}))
  },
});

// Si el servidor rechaza el token (por ejemplo, porque venció), se intenta
// renovarlo y reconectar, con un máximo de reintentos.
let reintentos = 0
socket.on('connect', () => {
  reintentos = 0
})
socket.on('connect_error', async () => {
  if (socket.active || reintentos >= 3) return
  reintentos++
  try {
    await refreshAccessToken()
  } catch {}
  setTimeout(() => {
    if (!socket.connected) socket.connect()
  }, 1000 * reintentos)
})

export function conectarSocket() {
  reintentos = 0
  if (socket.connected) socket.disconnect()
  socket.connect()
}

export function desconectarSocket() {
  reintentos = 3
  socket.disconnect()
}
