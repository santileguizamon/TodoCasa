import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { useCallback, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { obtenerMisTrabajosProfesional } from '../../../../api/trabajos.api'
import { profesionalMisTrabajosStyles as styles } from '../../../../styles/profesional-mis-trabajos.styles'

type TabType = 'ACTIVOS' | 'HISTORIAL'

const ESTADOS_ACTIVOS = ['ASIGNADO', 'PENDIENTE_CONFIRMACION']

export default function MisTrabajosProfesional() {
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tabActiva, setTabActiva] = useState<TabType>('ACTIVOS')

  const cargarTrabajos = useCallback(async () => {
    try {
      const res = await obtenerMisTrabajosProfesional()
      setTrabajos(Array.isArray(res) ? res : [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      cargarTrabajos()
    }, [cargarTrabajos]),
  )

  const trabajosFiltrados = useMemo(() => {
    if (tabActiva === 'ACTIVOS') {
      return trabajos.filter((t) => ESTADOS_ACTIVOS.includes(t.estado))
    }

    return trabajos.filter((t) => t.estado === 'FINALIZADO')
  }, [trabajos, tabActiva])

  const cantidadActivos = useMemo(
    () => trabajos.filter((t) => ESTADOS_ACTIVOS.includes(t.estado)).length,
    [trabajos],
  )

  const cantidadHistorial = useMemo(
    () => trabajos.filter((t) => t.estado === 'FINALIZADO').length,
    [trabajos],
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
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={trabajosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          cargarTrabajos()
        }}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.heroCard}>
              <Text style={styles.heroKicker}>Panel de trabajo</Text>
              <Text style={styles.heroTitle}>Mis trabajos</Text>
              <Text style={styles.heroSubtitle}>
                Gestiona los trabajos asignados y revisa tu historial.
              </Text>
            </View>

            <View style={styles.tabsContainer}>
              <TabButton
                label={`Activos (${cantidadActivos})`}
                active={tabActiva === 'ACTIVOS'}
                onPress={() => setTabActiva('ACTIVOS')}
              />

              <TabButton
                label={`Historial (${cantidadHistorial})`}
                active={tabActiva === 'HISTORIAL'}
                onPress={() => setTabActiva('HISTORIAL')}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {tabActiva === 'ACTIVOS'
                ? 'No tenes trabajos en curso'
                : 'Todavia no tenes trabajos finalizados'}
            </Text>
            <Text style={styles.emptyText}>Volve a explorar nuevas oportunidades.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const esHistorial = item.estado === 'FINALIZADO'
          const estadoInfo = mapEstado(item.estado)

          return (
            <Pressable
              onPress={() => router.push(`/profesional/trabajos/${item.id}` as any)}
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.titulo}>{item.titulo}</Text>
                <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.bg }]}>
                  <Text style={[styles.estadoBadgeText, { color: estadoInfo.text }]}>
                    {estadoInfo.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.cliente}>
                Cliente: {item.cliente?.nombre || 'No informado'}
              </Text>

              {item.fechaAcordada ? (
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color="#1E40AF" />
                  <Text style={styles.metaText}>
                    Fecha acordada: {new Date(item.fechaAcordada).toLocaleDateString('es-AR')}
                  </Text>
                </View>
              ) : null}

              {esHistorial ? (
                <View style={styles.ratingBlock}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
                  <Text style={styles.valoracion}>
                    {item.valoracion ? 'Valoración registrada' : 'Sin valoración'}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          )
        }}
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
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  )
}

function mapEstado(estado: string) {
  if (estado === 'PENDIENTE_CONFIRMACION') {
    return { label: 'Pendiente', bg: '#FEF3C7', text: '#92400E' }
  }
  if (estado === 'ASIGNADO') {
    return { label: 'Asignado', bg: '#DBEAFE', text: '#1E3A8A' }
  }
  if (estado === 'FINALIZADO') {
    return { label: 'Finalizado', bg: '#DCFCE7', text: '#166534' }
  }
  return { label: estado, bg: '#E5E7EB', text: '#374151' }
}
