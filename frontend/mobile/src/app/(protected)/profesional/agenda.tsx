import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { obtenerMisTrabajosProfesional } from '@/src/api/trabajos.api'
import { profesionalAgendaStyles as styles } from '@/src/styles/profesional-agenda.styles'

type TrabajoAgenda = {
  id: number
  titulo: string
  estado: string
  fechaAcordada?: string | null
  cliente?: { nombre?: string | null } | null
}

type AgendaGrupo = {
  fechaKey: string
  fechaLabel: string
  items: TrabajoAgenda[]
}

const ESTADOS_VISIBLES = new Set(['ASIGNADO', 'PENDIENTE_CONFIRMACION'])

export default function AgendaProfesionalScreen() {
  const [trabajos, setTrabajos] = useState<TrabajoAgenda[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mesActual, setMesActual] = useState(inicioDeMes(new Date()))
  const [fechaSeleccionada, setFechaSeleccionada] = useState(toLocalKey(new Date()))

  const cargar = useCallback(async () => {
    try {
      const res = await obtenerMisTrabajosProfesional()
      setTrabajos(Array.isArray(res) ? (res as TrabajoAgenda[]) : [])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      cargar()
    }, [cargar]),
  )

  const trabajosPorDia = useMemo(() => {
    const map = new Map<string, TrabajoAgenda[]>()

    for (const t of trabajos) {
      if (!t.fechaAcordada || !ESTADOS_VISIBLES.has(t.estado)) continue

      const fecha = new Date(t.fechaAcordada)
      const key = toLocalKey(fecha)
      const list = map.get(key) ?? []
      list.push(t)
      map.set(key, list)
    }
    return map
  }, [trabajos])

  const calendario = useMemo(() => {
    const inicio = inicioGrillaMes(mesActual)
    const dias: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      dias.push(d)
    }
    return dias
  }, [mesActual])

  const trabajosDelDia = useMemo<AgendaGrupo | null>(() => {
    const items = (trabajosPorDia.get(fechaSeleccionada) ?? []).sort((a, b) => a.id - b.id)
    if (!items.length) return null
    const date = fromLocalKey(fechaSeleccionada)
    const fechaLabel = date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })
    return {
      fechaKey: fechaSeleccionada,
      fechaLabel: fechaLabel.charAt(0).toUpperCase() + fechaLabel.slice(1),
      items,
    }
  }, [fechaSeleccionada, trabajosPorDia])

  useEffect(() => {
    const seleccion = fromLocalKey(fechaSeleccionada)
    if (
      seleccion.getFullYear() !== mesActual.getFullYear() ||
      seleccion.getMonth() !== mesActual.getMonth()
    ) {
      const primerDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
      setFechaSeleccionada(toLocalKey(primerDiaMes))
    }
  }, [mesActual, fechaSeleccionada])

  const tituloMes = useMemo(
    () =>
      mesActual.toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      }),
    [mesActual],
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
        data={trabajosDelDia ? [trabajosDelDia] : []}
        keyExtractor={(item) => item.fechaKey}
        contentContainerStyle={styles.content}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true)
          cargar()
        }}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.heroCard}>
              <Text style={styles.heroKicker}>Planificacion</Text>
              <Text style={styles.heroTitle}>Agenda de trabajos</Text>
              <Text style={styles.heroSubtitle}>
                Organiza tus trabajos por mes y fecha.
              </Text>
            </View>

            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <Pressable
                  style={styles.monthArrow}
                  onPress={() =>
                    setMesActual(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                    )
                  }
                >
                  <Ionicons name="chevron-back" size={18} color="#1E3A8A" />
                </Pressable>

                <Text style={styles.monthTitle}>
                  {tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1)}
                </Text>

                <Pressable
                  style={styles.monthArrow}
                  onPress={() =>
                    setMesActual(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                    )
                  }
                >
                  <Ionicons name="chevron-forward" size={18} color="#1E3A8A" />
                </Pressable>
              </View>

              <View style={styles.weekDaysRow}>
                {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map((d) => (
                  <Text key={d} style={styles.weekDayText}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {calendario.map((dia) => {
                  const key = toLocalKey(dia)
                  const cantidad = (trabajosPorDia.get(key) ?? []).length
                  const esMesActual =
                    dia.getMonth() === mesActual.getMonth() &&
                    dia.getFullYear() === mesActual.getFullYear()
                  const seleccionado = key === fechaSeleccionada
                  const hoy = key === toLocalKey(new Date())

                  return (
                    <Pressable
                      key={key}
                      onPress={() => setFechaSeleccionada(key)}
                      style={[
                        styles.dayCell,
                        !esMesActual && styles.dayCellOutside,
                        seleccionado && styles.dayCellSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          !esMesActual && styles.dayNumberOutside,
                          seleccionado && styles.dayNumberSelected,
                          hoy && !seleccionado && styles.dayNumberToday,
                        ]}
                      >
                        {dia.getDate()}
                      </Text>
                      {cantidad > 0 ? (
                        <View style={styles.dotWrap}>
                          <View style={styles.dot} />
                          <Text style={styles.dotCount}>{cantidad}</Text>
                        </View>
                      ) : null}
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-clear-outline" size={22} color="#64748B" />
            <Text style={styles.emptyTitle}>No hay trabajos para esta fecha</Text>
            <Text style={styles.emptyText}>
              Selecciona otro dia o espera nuevas fechas confirmadas.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.dayBlock}>
            <Text style={styles.dayTitle}>{item.fechaLabel}</Text>
            {item.items.map((trabajo) => (
              <Pressable
                key={trabajo.id}
                style={styles.card}
                onPress={() => router.push(`/profesional/trabajos/${trabajo.id}` as any)}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{trabajo.titulo}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {trabajo.estado === 'ASIGNADO' ? 'Asignado' : 'Pendiente'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardMeta}>
                  Cliente: {trabajo.cliente?.nombre || 'No informado'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      />
    </View>
  )
}

function inicioDeMes(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function inicioGrillaMes(date: Date) {
  const first = inicioDeMes(date)
  const day = first.getDay()
  const diff = day === 0 ? 6 : day - 1
  const start = new Date(first)
  start.setDate(first.getDate() - diff)
  return start
}

function toLocalKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fromLocalKey(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}
