import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  BackHandler,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import { obtenerTrabajo } from '../../../../api/trabajos.api'
import {
  crearOferta,
  obtenerMiOfertaPorTrabajo,
} from '../../../../api/ofertas.api'
import { useAuth } from '../../../../context/auth-context'
import { obtenerMiSuscripcion } from '../../../../pagos/pagos.service'

import { AppLoader } from '../../../../components/AppLoader'
import { RADIUS, SPACING } from '../../../../theme'

const ESTADOS = {
  PUBLICADO: 'PENDIENTE',
  EN_PROGRESO: 'ASIGNADO',
  FINALIZADO: 'FINALIZADO',
} as const

function suscripcionVigente(s: any): boolean {
  if (!s?.activa) return false
  if (!s?.fechaFin) return true
  return new Date(s.fechaFin) > new Date()
}

export default function DetalleTrabajoProfesional() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, token } = useAuth()
  const navigation = useNavigation()

  const [trabajo, setTrabajo] = useState<any>(null)
  const [miOferta, setMiOferta] = useState<any>(null)
  const [monto, setMonto] = useState('')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [suscripcionActiva, setSuscripcionActiva] = useState<boolean | null>(
    null,
  )

  useEffect(() => {
    if (!id) return

    setLoading(true)

    Promise.all([obtenerTrabajo(Number(id)), obtenerMiOfertaPorTrabajo(Number(id))])
      .then(([trabajoRes, ofertaRes]) => {
        setTrabajo(trabajoRes)
        setMiOferta(ofertaRes || null)
      })
      .catch(() => Alert.alert('Error', 'No se pudo cargar el trabajo'))
      .finally(() => setLoading(false))
  }, [id])

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

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        const actionType = e.data.action.type
        if (actionType !== 'REPLACE') {
          e.preventDefault()
          router.replace('/profesional/trabajos' as any)
        }
      })

      return unsubscribe
    }, [navigation]),
  )

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace('/profesional/trabajos' as any)
        return true
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      )

      return () => subscription.remove()
    }, []),
  )

  async function enviarOferta() {
    const montoNum = Number(monto)

    if (!monto || Number.isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'Monto invalido')
      return
    }

    if (enviando) return
    setEnviando(true)

    try {
      await crearOferta({
        trabajoId: trabajo.id,
        monto: montoNum,
      })

      Alert.alert('Oferta enviada correctamente')
      setMonto('')
      const nueva = await obtenerMiOfertaPorTrabajo(trabajo.id)
      setMiOferta(nueva)
    } catch (error: any) {
      let message = 'No se pudo enviar la oferta'
      const raw = error?.message
      if (typeof raw === 'string' && raw.trim()) {
        try {
          const parsed = JSON.parse(raw)
          message = parsed?.message ?? raw
        } catch {
          message = raw
        }
      }
      Alert.alert('Error', message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <AppLoader />
  if (!trabajo) return null

  const puedeOfertar =
    trabajo.estado === ESTADOS.PUBLICADO &&
    !miOferta &&
    suscripcionActiva === true

  const fueAceptada = miOferta?.fueAceptada === true

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        onPress={() => router.replace('/profesional/trabajos' as any)}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={16} color="#1E3A8A" />
        <Text style={styles.backText}>Volver a explorar</Text>
      </Pressable>

      <View style={styles.pageHeader}>
        <Text style={styles.pageHeaderTitle}>Detalle del trabajo</Text>
        <Text style={styles.pageHeaderSubtitle}>
          Revisa la informacion y envia tu propuesta
        </Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Text style={styles.titulo}>{trabajo.titulo}</Text>
          {trabajo.urgente ? (
            <View style={styles.badgeUrgente}>
              <Text style={styles.badgeUrgenteText}>Urgente</Text>
            </View>
          ) : null}
        </View>

        {trabajo.categoria ? (
          <Text style={styles.categoria}>Categoria: {trabajo.categoria}</Text>
        ) : null}
        <Text style={styles.descripcion}>{trabajo.descripcion}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Detalle del trabajo</Text>
        <Text style={styles.cliente}>
          Cliente: {trabajo.cliente?.nombre || 'No informado'}
        </Text>
        <Text style={styles.direccion}>
          Direccion: {trabajo.direccion || 'No informada'}
        </Text>

        <View style={styles.detailSeparator} />

        <View style={styles.metaRow}>
          <MetaPill icon="cash-outline" label={`$${trabajo.rangoMin} - $${trabajo.rangoMax}`} />
          {trabajo.distanciaKm ? (
            <MetaPill
              icon="location-outline"
              label={`${trabajo.distanciaKm.toFixed(1)} km`}
            />
          ) : null}
        </View>
      </View>

      {miOferta ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tu oferta</Text>

          <Text style={styles.ofertaMonto}>${miOferta.monto}</Text>

          <View style={styles.badgeEstado}>
            <Text style={styles.badgeTexto}>
              {fueAceptada ? 'Oferta aceptada' : 'Oferta enviada'}
            </Text>
          </View>

          {fueAceptada ? (
            <PrimaryButton
              label="Abrir chat"
              onPress={() =>
                router.push({
                  pathname: '/chat/[trabajoId]' as any,
                  params: { trabajoId: String(trabajo.id) },
                })
              }
            />
          ) : null}
        </View>
      ) : null}

      {trabajo.estado === ESTADOS.PUBLICADO &&
      !miOferta &&
      suscripcionActiva === false ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>No puedes ofertar por ahora</Text>
          <Text style={styles.warningText}>
            Tu suscripcion esta inactiva. Regularizala para enviar ofertas.
          </Text>

          <PrimaryButton
            label="Regularizar suscripcion"
            onPress={() => router.push('/(public)/suscripcion-pendiente' as any)}
          />
        </View>
      ) : null}

      {puedeOfertar ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Enviar oferta</Text>
          <Text style={styles.sectionHint}>
            Ingresa un monto dentro del presupuesto publicado.
          </Text>
          {trabajo.urgente ? (
            <Text style={styles.urgenteHint}>
              Trabajo urgente: al cliente se le aplicara x1.5 sobre la oferta aceptada.
            </Text>
          ) : null}

          <TextInput
            placeholder="Tu oferta en $"
            placeholderTextColor="#7F96BB"
            keyboardType="numeric"
            value={monto}
            onChangeText={setMonto}
            style={styles.input}
          />

          <PrimaryButton
            label={enviando ? 'Enviando...' : 'Enviar oferta'}
            onPress={enviarOferta}
            disabled={enviando}
          />
        </View>
      ) : null}

      {trabajo.estado !== ESTADOS.PUBLICADO && !miOferta ? (
        <View style={styles.card}>
          <Text style={styles.noDisponibleTitle}>
            Este trabajo ya no esta disponible
          </Text>
          <Text style={styles.noDisponibleText}>Estado actual: {trabajo.estado}</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}

function MetaPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
}) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={14} color="#1E3A8A" />
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  )
}

function PrimaryButton({ label, onPress, disabled }: any) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryButton, disabled && { opacity: 0.6 }]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF2FF',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 30,
    paddingBottom: 40,
    gap: 14,
  },
  pageHeader: {
    marginTop: 2,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  pageHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0E2C59',
    letterSpacing: 0.2,
  },
  pageHeaderSubtitle: {
    marginTop: 6,
    color: '#486A97',
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E4EEFF',
    borderColor: '#C8DAFF',
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  backText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: '#DDEBFF',
    borderColor: '#BDD3FF',
    borderWidth: 1,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    shadowColor: '#2563EB',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titulo: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0D2A57',
    flex: 1,
  },
  categoria: {
    marginTop: 6,
    color: '#3A5F92',
    fontWeight: '600',
  },
  cliente: {
    marginTop: 4,
    color: '#456891',
    fontWeight: '600',
  },
  descripcion: {
    marginTop: 10,
    color: '#2F4E78',
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDF4FF',
    borderColor: '#C5D9FF',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaPillText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 12,
  },
  direccion: {
    marginTop: 10,
    color: '#3E618E',
    fontWeight: '600',
  },
  badgeUrgente: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 2,
  },
  badgeUrgenteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  card: {
    backgroundColor: '#F7FAFF',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#D4E2FA',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 8,
    color: '#173A6B',
    fontSize: 15,
  },
  detailSeparator: {
    height: 1,
    backgroundColor: '#D5E4FF',
    marginTop: 12,
  },
  sectionHint: {
    marginTop: 10,
    marginBottom: 4,
    color: '#4E6E9A',
  },
  urgenteHint: {
    marginBottom: 10,
    color: '#B45309',
    fontWeight: '700',
  },
  ofertaMonto: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10386E',
  },
  badgeEstado: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeTexto: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#BFD5F8',
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ECF4FF',
    color: '#0F2A52',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  noDisponibleTitle: {
    fontWeight: '800',
    color: '#143C6B',
  },
  noDisponibleText: {
    marginTop: 6,
    color: '#4A6D99',
  },
  warningCard: {
    backgroundColor: '#FFECCF',
    borderColor: '#F59E0B',
    borderWidth: 1,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  warningTitle: {
    color: '#92400E',
    fontWeight: '800',
  },
  warningText: {
    color: '#B45309',
    marginTop: 6,
    marginBottom: 4,
  },
})
