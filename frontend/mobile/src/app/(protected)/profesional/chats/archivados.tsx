import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'

import { obtenerChats, restaurarChat } from '../../../../api/chat.api'
import { socket } from '../../../../lib/socket'
import { chatsStyles as styles } from '../../../../styles/chats.styles'

export default function ProfesionalChatsArchivados() {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const cargarChats = useCallback(async () => {
    try {
      const res = await obtenerChats({ archivados: true })
      setChats(Array.isArray(res) ? res : [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    cargarChats()
  }, [cargarChats])

  useFocusEffect(
    useCallback(() => {
      cargarChats()
    }, [cargarChats]),
  )

  useEffect(() => {
    const handleActualizado = () => {
      cargarChats()
    }

    socket.on('chatActualizado', handleActualizado)

    return () => {
      socket.off('chatActualizado', handleActualizado)
    }
  }, [cargarChats])

  const handleRestaurar = useCallback(
    async (chatId: number) => {
      try {
        await restaurarChat(chatId)
        await cargarChats()
      } catch {
        Alert.alert('Error', 'No se pudo restaurar el chat')
      }
    },
    [cargarChats],
  )

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats archivados</Text>
      </View>

      <Pressable
        onPress={() => router.back()}
        style={{ alignSelf: 'flex-end', marginRight: 18, marginBottom: 6 }}
      >
        <Text style={{ color: '#2563EB', fontWeight: '700' }}>
          Volver a chats
        </Text>
      </Pressable>

      <FlatList
        style={styles.list}
        data={chats}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          cargarChats()
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No tenes chats archivados</Text>
            <Text style={styles.emptyText}>
              Los chats archivados aparecen aca y pueden restaurarse.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const ultimoMensaje = item.mensajes?.[0]?.contenido || 'Sin mensajes todavia'
          const fecha = item.mensajes?.[0]?.enviadoEn
            ? formatHora(item.mensajes[0].enviadoEn)
            : ''
          const nombreCliente = item.cliente?.nombre || 'Cliente'
          const inicial = nombreCliente.charAt(0).toUpperCase()

          return (
            <Pressable
              onPress={() => router.push(`/chat/${item.trabajoId}` as any)}
              style={styles.row}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{inicial}</Text>
              </View>

              <View style={styles.mainCol}>
                <View style={styles.topRow}>
                  <Text style={styles.nombre} numberOfLines={1}>
                    {nombreCliente}
                  </Text>
                  {fecha ? <Text style={styles.hora}>{fecha}</Text> : null}
                </View>

                <Text style={styles.tituloTrabajo} numberOfLines={1}>
                  {item.trabajo?.titulo || 'Trabajo'}
                </Text>

                <Text style={styles.preview} numberOfLines={1}>
                  {ultimoMensaje}
                </Text>

                <Pressable
                  onPress={() => handleRestaurar(item.id)}
                  style={{ alignSelf: 'flex-start', marginTop: 8 }}
                >
                  <Text style={{ color: '#1D4ED8', fontWeight: '700' }}>
                    Restaurar chat
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          )
        }}
      />
    </View>
  )
}

function formatHora(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
