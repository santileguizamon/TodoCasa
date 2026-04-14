import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

import {
  eliminarTrabajo,
  obtenerMisTrabajosCliente,
} from '../../../api/trabajos.api'
import { trabajosStyles as styles } from '../../../styles/trabajos.styles'

interface Trabajo {
  id: number
  titulo: string
  descripcion: string
  estado:
    | 'PENDIENTE'
    | 'ASIGNADO'
    | 'PENDIENTE_CONFIRMACION'
    | 'FINALIZADO'
    | 'CANCELADO'
    | 'EN_RECLAMO'
  ofertas?: any[]
  creadoEn?: string
  createdAt?: string
  fechaFin?: string
}

type TabType = 'ACTIVOS' | 'HISTORIAL'

const ESTADOS_ACTIVOS = ['PENDIENTE', 'ASIGNADO', 'PENDIENTE_CONFIRMACION']

export default function MisTrabajosScreen() {
  const [tab, setTab] = useState<TabType>('ACTIVOS')
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const cargar = useCallback(async () => {
    try {
      const res = await obtenerMisTrabajosCliente()
      setTrabajos(Array.isArray(res) ? res : [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    cargar()
  }, [cargar])

  useFocusEffect(
    useCallback(() => {
      cargar()
    }, [cargar]),
  )

  const activos = useMemo(
    () => trabajos.filter((t) => ESTADOS_ACTIVOS.includes(t.estado)),
    [trabajos],
  )

  const historial = useMemo(
    () => trabajos.filter((t) => t.estado === 'FINALIZADO'),
    [trabajos],
  )

  const data = tab === 'ACTIVOS' ? activos : historial

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          cargar()
        }}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>Mis trabajos</Text>
              <Text style={styles.heroSubtitle}>
                Revisa el estado de cada publicacion y avanza con tus solicitudes.
              </Text>
            </View>

            <View style={styles.tabsContainer}>
              <TabButton
                label={`Activos (${activos.length})`}
                active={tab === 'ACTIVOS'}
                onPress={() => setTab('ACTIVOS')}
              />
              <TabButton
                label={`Historial (${historial.length})`}
                active={tab === 'HISTORIAL'}
                onPress={() => setTab('HISTORIAL')}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {tab === 'ACTIVOS'
                ? 'No tenes trabajos activos'
                : 'Todavia no tenes trabajos finalizados'}
            </Text>
            <Text style={styles.emptyText}>Publica un trabajo para empezar.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TrabajoCard
            item={item}
            onDelete={async () => {
              await eliminarTrabajo(item.id)
              setTrabajos((prev) => prev.filter((trabajo) => trabajo.id !== item.id))
            }}
          />
        )}
      />
    </View>
  )
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  )
}

function TrabajoCard({
  item,
  onDelete,
}: {
  item: Trabajo
  onDelete: () => Promise<void>
}) {
  const estado = mapEstado(item.estado)
  const ofertasCount = Array.isArray(item.ofertas) ? item.ofertas.length : 0

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/cliente/trabajo/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.titulo} numberOfLines={1}>
          {item.titulo}
        </Text>
        <View style={[styles.badge, { backgroundColor: estado.bg }]}
        >
          <Text style={[styles.badgeText, { color: estado.text }]}>{estado.label}</Text>
        </View>
      </View>

      <Text style={styles.descripcion} numberOfLines={2}>
        {item.descripcion}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Ionicons name="pricetag-outline" size={14} color="#1E40AF" />
          <Text style={styles.metaPillText}>{ofertasCount} oferta(s)</Text>
        </View>
      </View>

      {item.estado === 'PENDIENTE' ? (
        <Pressable
          onPress={() => {
            Alert.alert(
              'Eliminar trabajo',
              'Esta accion no se puede deshacer. Queres continuar?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: () => {
                    onDelete().catch(() => {
                      Alert.alert('Error', 'No se pudo eliminar el trabajo')
                    })
                  },
                },
              ],
            )
          }}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={14} color="#B42318" />
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </Pressable>
      ) : null}
    </Pressable>
  )
}

function mapEstado(estado: Trabajo['estado']) {
  if (estado === 'PENDIENTE') {
    return { label: 'Publicado', bg: '#DBEAFE', text: '#1E3A8A' }
  }
  if (estado === 'ASIGNADO') {
    return { label: 'Asignado', bg: '#E0E7FF', text: '#3730A3' }
  }
  if (estado === 'PENDIENTE_CONFIRMACION') {
    return { label: 'Pend. confirmacion', bg: '#FEF3C7', text: '#92400E' }
  }
  if (estado === 'FINALIZADO') {
    return { label: 'Finalizado', bg: '#DCFCE7', text: '#166534' }
  }
  if (estado === 'CANCELADO') {
    return { label: 'Cancelado', bg: '#FEE2E2', text: '#991B1B' }
  }
  return { label: 'En reclamo', bg: '#F3E8FF', text: '#6B21A8' }
}
