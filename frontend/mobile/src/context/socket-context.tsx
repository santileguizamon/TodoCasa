import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './auth-context'

const SocketContext = createContext<any>(null)
const SOCKET_URL =
  process.env.EXPO_PUBLIC_WS_URL || process.env.EXPO_PUBLIC_API_URL || ''

export function SocketProvider({ children }: any) {
  const { token } = useAuth()
  const [socket, setSocket] = useState<any>(null)

  useEffect(() => {
    if (!token) return

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [token])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
