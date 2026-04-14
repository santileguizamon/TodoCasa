import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { obtenerTrabajosDisponibles } from '../../../../api/trabajos.api'
import { obtenerEspecialidades } from '../../../../api/profesionales.api'
import { router } from 'expo-router'
import { useLocation } from '../../../../hooks/useLocation'
import { useAuth } from '../../../../context/auth-context'
import { obtenerMiSuscripcion } from '../../../../pagos/pagos.service'
import { profesionalTrabajosStyles as styles } from '../../../../styles/profesional-trabajos.styles'

const BUDGET_MIN = 0
const BUDGET_MAX = 500000
const BUDGET_STEP = 10000

function suscripcionVigente(s: any): boolean {
  if (!s?.activa) return false
  if (!s?.fechaFin) return true
  return new Date(s.fechaFin) > new Date()
}

export default function TrabajosProfesionalScreen() {
  const [trabajos, setTrabajos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [soloUrgentes, setSoloUrgentes] = useState(false)
  const [filtroTodasActivo, setFiltroTodasActivo] = useState(false)
  const [mostrarFiltroPrecio, setMostrarFiltroPrecio] = useState(false)
  const [mostrarFiltroEspecialidades, setMostrarFiltroEspecialidades] =
    useState(false)
  const [suscripcionActiva, setSuscripcionActiva] =
    useState<boolean | null>(null)
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<
    Array<{ id: number; nombre: string }>
  >([])
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] =
    useState<number[]>([])
  const [presupuestoMin, setPresupuestoMin] = useState(0)
  const [presupuestoMax, setPresupuestoMax] = useState(500000)
  const [trackWidth, setTrackWidth] = useState(1)

  const { location } = useLocation()
  const { user, token } = useAuth()

  const actualizarDesdePosicion = useCallback(
    (x: number, tipo: 'min' | 'max') => {
      const clampedX = Math.max(0, Math.min(x, trackWidth))
      const ratio = clampedX / trackWidth
      const raw = BUDGET_MIN + ratio * (BUDGET_MAX - BUDGET_MIN)
      const snapped = Math.round(raw / BUDGET_STEP) * BUDGET_STEP
      const value = Math.max(BUDGET_MIN, Math.min(BUDGET_MAX, snapped))

      if (tipo === 'min') {
        setPresupuestoMin(Math.min(value, presupuestoMax))
      } else {
        setPresupuestoMax(Math.max(value, presupuestoMin))
      }
    },
    [trackWidth, presupuestoMin, presupuestoMax],
  )

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width
    if (width > 0) setTrackWidth(width)
  }, [])

  const minThumbLeft =
    ((presupuestoMin - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * trackWidth
  const maxThumbLeft =
    ((presupuestoMax - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * trackWidth

  const cargarTrabajos = useCallback(async () => {
    try {
      setLoading(true)
      let data: any[] = []
      const lat = location?.latitude ?? user?.lat ?? undefined
      const lng = location?.longitude ?? user?.lng ?? undefined

      if (typeof lat === 'number' && typeof lng === 'number') {
        data = await obtenerTrabajosDisponibles({
          lat,
          lng,
          radio: 15,
          urgente: soloUrgentes ? true : undefined,
        })
      } else {
        data = await obtenerTrabajosDisponibles({
          urgente: soloUrgentes ? true : undefined,
        })
      }

      setTrabajos(Array.isArray(data) ? data : [])
    } catch (e) {
      console.log('Error cargando trabajos', e)
      setTrabajos([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [location, user?.lat, user?.lng, soloUrgentes])

  const trabajosFiltrados = useMemo(
    () =>
      trabajos.filter((t) => {
        if (soloUrgentes && !t.urgente) return false

        if (especialidadesSeleccionadas.length > 0) {
          const categoria = String(t.categoria || '')
            .trim()
            .toLowerCase()
          const nombresSeleccionados = especialidadesDisponibles
            .filter((esp) => especialidadesSeleccionadas.includes(esp.id))
            .map((esp) => esp.nombre.trim().toLowerCase())

          if (
            !categoria ||
            !nombresSeleccionados.some(
              (nombre) =>
                categoria === nombre ||
                categoria.includes(nombre) ||
                nombre.includes(categoria),
            )
          ) {
            return false
          }
        }

        const min = Number(t.rangoMin ?? 0)
        const max = Number(t.rangoMax ?? 0)
        return max >= presupuestoMin && min <= presupuestoMax
      }),
    [
      trabajos,
      soloUrgentes,
      presupuestoMin,
      presupuestoMax,
      especialidadesSeleccionadas,
      especialidadesDisponibles,
    ],
  )

  useEffect(() => {
    cargarTrabajos()
  }, [cargarTrabajos])

  useEffect(() => {
    let cancelled = false

    obtenerEspecialidades()
      .then((res) => {
        if (!cancelled && Array.isArray(res)) {
          setEspecialidadesDisponibles(res)
        }
      })
      .catch(() => {
        if (!cancelled) setEspecialidadesDisponibles([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!user || user.rol !== 'PROFESIONAL' || !token) return

      let cancelled = false

      obtenerMiSuscripcion(token)
        .then((res) => {
          if (!cancelled) setSuscripcionActiva(suscripcionVigente(res))
        })
        .catch(() => {
          if (!cancelled) setSuscripcionActiva(false)
        })

      return () => {
        cancelled = true
      }
    }, [user, token]),
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
              <Text style={styles.heroKicker}>Explorar</Text>
              <Text style={styles.heroTitle}>Trabajos disponibles</Text>
              <Text style={styles.heroSubtitle}>
                Encuentra oportunidades cercanas y aplica filtros por prioridad y presupuesto.
              </Text>
              <View style={styles.heroMeta}>
                <Ionicons name="briefcase-outline" size={14} color="#1D4ED8" />
                <Text style={styles.heroMetaText}>
                  {trabajosFiltrados.length} resultados
                </Text>
              </View>
            </View>

            {suscripcionActiva === false && (
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>Suscripcion inactiva</Text>
                <Text style={styles.warningText}>
                  Podes explorar trabajos, pero no enviar ofertas hasta regularizarla.
                </Text>
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersRow}
            >
              <FilterPill
                label="Urgentes"
                active={soloUrgentes}
                onPress={() => setSoloUrgentes((prev) => !prev)}
              />

              <FilterPill
                label="Todas"
                active={filtroTodasActivo}
                onPress={() => setFiltroTodasActivo((prev) => !prev)}
              />

              <FilterPill
                label="Precio"
                active={mostrarFiltroPrecio}
                onPress={() => setMostrarFiltroPrecio((prev) => !prev)}
              />

              <FilterPill
                label="Especialidades"
                active={mostrarFiltroEspecialidades}
                onPress={() => setMostrarFiltroEspecialidades((prev) => !prev)}
              />
            </ScrollView>

            {mostrarFiltroPrecio && (
              <View style={styles.budgetBlock}>
                <View style={styles.budgetHeader}>
                  <Ionicons name="cash-outline" size={15} color="#1D4ED8" />
                  <Text style={styles.budgetTitle}>Precio</Text>
                </View>
                <Text style={styles.budgetText}>
                  ${presupuestoMin.toLocaleString('es-AR')} - ${presupuestoMax.toLocaleString('es-AR')}
                </Text>

                <Text style={styles.sliderLabel}>
                  Minimo: ${presupuestoMin.toLocaleString('es-AR')}
                </Text>
                <View
                  style={styles.sliderTrack}
                  onLayout={onTrackLayout}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={(e) =>
                    actualizarDesdePosicion(e.nativeEvent.locationX, 'min')
                  }
                  onResponderMove={(e) =>
                    actualizarDesdePosicion(e.nativeEvent.locationX, 'min')
                  }
                >
                  <View style={[styles.thumb, { left: minThumbLeft - 10 }]} />
                </View>

                <Text style={styles.sliderLabel}>
                  Maximo: ${presupuestoMax.toLocaleString('es-AR')}
                </Text>
                <View
                  style={styles.sliderTrack}
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={(e) =>
                    actualizarDesdePosicion(e.nativeEvent.locationX, 'max')
                  }
                  onResponderMove={(e) =>
                    actualizarDesdePosicion(e.nativeEvent.locationX, 'max')
                  }
                >
                  <View style={[styles.thumb, { left: maxThumbLeft - 10 }]} />
                </View>
              </View>
            )}

            {mostrarFiltroEspecialidades && (
              <View style={styles.specialtyFilterBlock}>
                <View style={styles.budgetHeader}>
                  <Ionicons name="pricetags-outline" size={15} color="#1D4ED8" />
                  <Text style={styles.budgetTitle}>Filtrar por especialidad</Text>
                </View>

                {especialidadesDisponibles.length === 0 ? (
                  <Text style={styles.specialtyEmptyText}>
                    Aun no hay especialidades cargadas por admin.
                  </Text>
                ) : (
                  <View style={styles.specialtyWrap}>
                    {especialidadesDisponibles.map((esp) => {
                      const selected = especialidadesSeleccionadas.includes(esp.id)
                      return (
                        <Pressable
                          key={esp.id}
                          onPress={() =>
                            setEspecialidadesSeleccionadas((prev) =>
                              selected
                                ? prev.filter((id) => id !== esp.id)
                                : [...prev, esp.id],
                            )
                          }
                          style={[
                            styles.specialtyChip,
                            selected && styles.specialtyChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.specialtyChipText,
                              selected && styles.specialtyChipTextActive,
                            ]}
                          >
                            {esp.nombre}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No hay trabajos disponibles</Text>
            <Text style={styles.emptyText}>Proba cambiar los filtros.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push(`/profesional/trabajos/${item.id}` as any)
            }
            style={styles.card}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={styles.titulo}>{item.titulo}</Text>

              <View style={styles.cardTags}>
                {item.categoria ? (
                  <View style={styles.badgeCategoria}>
                    <Text style={styles.badgeCategoriaText}>{item.categoria}</Text>
                  </View>
                ) : null}

                {item.urgente && (
                  <View style={styles.badgeUrgente}>
                    <Text style={styles.badgeText}>Urgente</Text>
                  </View>
                )}
              </View>
            </View>

            {item.categoria ? (
              <Text style={styles.categoria}>
                Especialidad: {item.categoria}
              </Text>
            ) : (
              <Text style={styles.categoria}>
                Especialidad: Sin definir
              </Text>
            )}

            <Text style={styles.descripcion}>{item.descripcion}</Text>

            <View style={styles.metaWrap}>
              <View style={styles.metaPill}>
                <Ionicons name="cash-outline" size={14} color="#1E40AF" />
                <Text style={styles.metaPillText}>
                  ${item.rangoMin} - ${item.rangoMax}
                </Text>
              </View>
              {item.distanciaKm ? (
                <View style={styles.metaPill}>
                  <Ionicons name="location-outline" size={14} color="#1E40AF" />
                  <Text style={styles.metaPillText}>
                    {item.distanciaKm.toFixed(1)} km
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.direccion}>
              Direccion: {item.direccion || 'No informada'}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}

function FilterPill({ label, active, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive]}>
        {label}
      </Text>
    </Pressable>
  )
}
