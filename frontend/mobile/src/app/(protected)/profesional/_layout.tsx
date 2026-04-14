import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SocketProvider } from '@/src/context/socket-context'
import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'

import { obtenerChats } from '@/src/api/chat.api'
import { socket } from '@/src/lib/socket'

export default function ProfesionalLayout() {
  const [unreadCount, setUnreadCount] = useState(0)

  const cargarNoLeidos = async () => {
    try {
      const res = await obtenerChats()
      const total = Array.isArray(res)
        ? res.reduce(
            (acc, c) => acc + Number(c.noLeidos ?? c._count?.mensajes ?? 0),
            0,
          )
        : 0
      setUnreadCount(total)
    } catch {
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    cargarNoLeidos()
  }, [])

  useEffect(() => {
    const handleActualizado = () => {
      cargarNoLeidos()
    }

    socket.on('chatActualizado', handleActualizado)

    return () => {
      socket.off('chatActualizado', handleActualizado)
    }
  }, [])

  return (
    <SocketProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#777',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#D7E3F5',
            height: 60,
            paddingBottom: 6,
            paddingTop: 6,
            elevation: 8,
          },
        }}
      >
        {/* HOME */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        {/* EXPLORAR TRABAJOS */}
        <Tabs.Screen
          name="trabajos/index"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />

        {/* MIS TRABAJOS */}
        <Tabs.Screen
          name="misTrabajos"
          options={{
            title: 'Mis trabajos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="briefcase" size={size} color={color} />
            ),
          }}
        />

        {/* AGENDA */}
        <Tabs.Screen
          name="agenda"
          options={{
            title: 'Agenda',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar" size={size} color={color} />
            ),
          }}
        />

        {/* CHATS */}
        <Tabs.Screen
          name="chats/index"
          options={{
            title: 'Chats',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size + 8, height: size + 8 }}>
                <Ionicons name="chatbubble" size={size} color={color} />
                {unreadCount > 0 ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: '#EF4444',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                ) : null}
              </View>
            ),
          }}
        />

        {/* PERFIL */}
        <Tabs.Screen
          name="perfil/index"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name="chats/archivados" options={{ href: null }} />
        <Tabs.Screen name="valoraciones/index" options={{ href: null }} />
        <Tabs.Screen name="trabajos/[id]" options={{ href: null }} />
        <Tabs.Screen name="trabajos/misTrabajos" options={{ href: null }} />
        <Tabs.Screen name="perfil/editar" options={{ href: null }} />
        <Tabs.Screen name="perfil/[id]" options={{ href: null }} />
      </Tabs>
    </SocketProvider>
  )
}
