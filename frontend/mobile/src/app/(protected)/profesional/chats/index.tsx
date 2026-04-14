import { useCallback, useEffect, useMemo, useState } from 'react'
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

import { obtenerChats, archivarChat } from '../../../../api/chat.api'
import { socket } from '../../../../lib/socket'
import { chatsStyles as styles } from '../../../../styles/chats.styles'

export default function ProfesionalChats() {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const cargarChats = useCallback(async () => {
    try {
      const res = await obtenerChats({ archivados: false })
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

  const totalNoLeidos = useMemo(
    () =>
      chats.reduce(
        (acc, c) => acc + Number(c.noLeidos ?? c._count?.mensajes ?? 0),
        0,
      ),
    [chats],
  )

  const handleArchivar = useCallback(
    async (chatId: number) => {
      try {
        await archivarChat(chatId)
        await cargarChats()
      } catch {
        Alert.alert('Error', 'No se pudo archivar el chat')
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
        <Text style={styles.headerTitle}>Chats</Text>
        {totalNoLeidos > 0 ? (
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{totalNoLeidos}</Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={() => router.push('/profesional/chats/archivados' as any)}
        style={{ alignSelf: 'flex-end', marginRight: 18, marginBottom: 6 }}
      >
        <Text style={{ color: '#2563EB', fontWeight: '700' }}>
          Ver archivados
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
            <Text style={styles.emptyTitle}>Todavia no tenes chats</Text>
            <Text style={styles.emptyText}>
              Cuando se acepte una oferta, la conversacion va a aparecer aca.
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const ultimoMensaje = item.mensajes?.[0]?.contenido || 'Sin mensajes todavia'
          const noLeidos = Number(item.noLeidos ?? item._count?.mensajes ?? 0)
          const fecha = item.mensajes?.[0]?.enviadoEn
            ? formatHora(item.mensajes[0].enviadoEn)
            : ''
          const nombreCliente = item.cliente?.nombre || 'Cliente'
          const inicial = nombreCliente.charAt(0).toUpperCase()

          return (
            <Pressable
              onPress={() => router.push(`/chat/${item.trabajoId}` as any)}
              style={[styles.row, noLeidos > 0 && styles.rowUnread]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{inicial}</Text>
              </View>

              <View style={styles.mainCol}>
                <View style={styles.topRow}>
                  <Text
                    style={[styles.nombre, noLeidos > 0 && styles.nombreUnread]}
                    numberOfLines={1}
                  >
                    {nombreCliente}
                  </Text>
                  {fecha ? <Text style={styles.hora}>{fecha}</Text> : null}
                </View>

                <Text style={styles.tituloTrabajo} numberOfLines={1}>
                  {item.trabajo?.titulo || 'Trabajo'}
                </Text>

                <Text
                  style={[styles.preview, noLeidos > 0 && styles.previewUnread]}
                  numberOfLines={1}
                >
                  {ultimoMensaje}
                </Text>

                {item.trabajo?.estado === 'FINALIZADO' ? (
                  <Pressable
                    onPress={() => handleArchivar(item.id)}
                    style={{ alignSelf: 'flex-start', marginTop: 8 }}
                  >
                    <Text style={{ color: '#1D4ED8', fontWeight: '700' }}>
                      Archivar chat
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {noLeidos > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{noLeidos}</Text>
                </View>
              ) : null}
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
