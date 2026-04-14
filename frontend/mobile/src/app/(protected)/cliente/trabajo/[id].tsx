import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Alert,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { obtenerTrabajo, finalizarTrabajo } from '../../../../api/trabajos.api'
import { obtenerOfertasPorTrabajo, aceptarOferta } from '../../../../api/ofertas.api'
import {
  crearValoracion,
  obtenerValoracionesPorProfesional,
} from '../../../../api/valoraciones.api'

import { obtenerResumenComentarios } from '../../../../lib/resumenComentaraios'
import { AppLoader } from '../../../../components/AppLoader'
import { trabajoDetalleStyles as styles } from '../../../../styles/trabajo-detalle.styles'

const ESTADOS = {
  PUBLICADO: 'PENDIENTE',
  EN_PROGRESO: 'ASIGNADO',
  PENDIENTE_CONFIRMACION: 'PENDIENTE_CONFIRMACION',
  FINALIZADO: 'FINALIZADO',
} as const

const URGENTE_MULTIPLIER = 1.5

export default function DetalleTrabajoCliente() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [trabajo, setTrabajo] = useState<any>(null)
  const [ofertas, setOfertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [accionando, setAccionando] = useState(false)

  const [promedios, setPromedios] = useState<Record<number, number>>({})
  const [comentarios, setComentarios] = useState<Record<number, string[]>>({})

  const [puntaje, setPuntaje] = useState<number | null>(null)
  const [comentario, setComentario] = useState('')

  async function cargarDatos() {
    if (!id) return

    try {
      setLoading(true)

      const [trabajoRes, ofertasRes] = await Promise.all([
        obtenerTrabajo(Number(id)),
        obtenerOfertasPorTrabajo(Number(id)),
      ])

      const ofertasList = Array.isArray(ofertasRes) ? ofertasRes : []
      setTrabajo(trabajoRes)
      setOfertas(ofertasList)
      await cargarReputacion(ofertasList)
    } catch {
      Alert.alert('Error', 'No se pudo cargar el trabajo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [id])

  async function cargarReputacion(ofertasList: any[]) {
    const promediosTemp: Record<number, number> = {}
    const comentariosTemp: Record<number, string[]> = {}

    await Promise.all(
      ofertasList.map(async (o) => {
        const res = await obtenerValoracionesPorProfesional(o.profesionalId)
        const valoraciones = Array.isArray(res) ? res : []

        if (valoraciones.length > 0) {
          const promedio =
            valoraciones.reduce((acc: number, v: any) => acc + v.puntaje, 0) /
            valoraciones.length

          promediosTemp[o.profesionalId] = Number(promedio.toFixed(1))

          const resumen = obtenerResumenComentarios(valoraciones, 2)
          comentariosTemp[o.profesionalId] = resumen.map((v) => v.comentario)
        }
      }),
    )

    setPromedios(promediosTemp)
    setComentarios(comentariosTemp)
  }

  async function handleAceptarOferta(ofertaId: number) {
    if (accionando) return
    setAccionando(true)

    try {
      await aceptarOferta(ofertaId)
      await cargarDatos()
    } catch {
      Alert.alert('Error', 'No se pudo aceptar la oferta')
    } finally {
      setAccionando(false)
    }
  }

  async function handleFinalizarTrabajo() {
    if (accionando) return
    setAccionando(true)

    try {
      await finalizarTrabajo(trabajo.id)
      await cargarDatos()
    } catch {
      Alert.alert('Error', 'No se pudo finalizar')
    } finally {
      setAccionando(false)
    }
  }

  async function handleEnviarValoracion() {
    if (!puntaje) {
      Alert.alert('Error', 'Selecciona un puntaje')
      return
    }

    if (!comentario.trim()) {
      Alert.alert('Error', 'El comentario es obligatorio')
      return
    }

    const profesionalId =
      trabajo?.chat?.profesionalId ?? ofertaAceptada?.profesionalId ?? null

    if (!profesionalId) {
      Alert.alert('Error', 'No se pudo identificar al profesional')
      return
    }

    if (accionando) return
    setAccionando(true)

    try {
      await crearValoracion({
        trabajoId: trabajo.id,
        profesionalId,
        puntaje,
        comentario: comentario.trim(),
      })

      setPuntaje(null)
      setComentario('')
      await cargarDatos()
    } catch {
      Alert.alert('Error', 'No se pudo enviar la valoracion')
    } finally {
      setAccionando(false)
    }
  }

  const profesionalAsignadoId = trabajo?.chat?.profesionalId ?? null

  const ofertaAceptada = useMemo(() => {
    if (!trabajo || trabajo.estado === ESTADOS.PUBLICADO || ofertas.length === 0) {
      return null
    }
    return (
      ofertas.find((o) => o.profesionalId === profesionalAsignadoId) ?? ofertas[0] ?? null
    )
  }, [trabajo, ofertas, profesionalAsignadoId])

  if (loading) return <AppLoader />
  if (!trabajo) return null

  const estadoInfo = mapEstado(trabajo.estado)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Detalle del trabajo</Text>
        <Text style={styles.titulo}>{trabajo.titulo}</Text>
        <Text style={styles.descripcion}>{trabajo.descripcion}</Text>
        <Text style={styles.locationText}>
          Direccion: {trabajo.direccion || 'No informada'}
        </Text>

        <View style={styles.heroMetaRow}>
          <View style={[styles.estadoBadge, { backgroundColor: estadoInfo.bg }]}>
            <Text style={[styles.estadoBadgeText, { color: estadoInfo.text }]}> 
              {estadoInfo.label}
            </Text>
          </View>
          <View style={styles.rangeBadge}>
            <Text style={styles.rangeBadgeText}>
              ${trabajo.rangoMin} - ${trabajo.rangoMax}
            </Text>
          </View>
          {trabajo.urgente ? (
            <View style={styles.urgenteBadge}>
              <Text style={styles.urgenteBadgeText}>Urgente</Text>
            </View>
          ) : null}
        </View>
      </View>

      {trabajo.estado === ESTADOS.PUBLICADO && !ofertaAceptada ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Ofertas recibidas</Text>
          {ofertas.length === 0 ? (
            <Text style={styles.emptyText}>Aun no recibiste ofertas para este trabajo.</Text>
          ) : null}

          {ofertas.map((o) => (
            <View key={o.id} style={styles.offerCard}>
              <View style={styles.offerTopRow}>
                <Text style={styles.offerName}>Profesional #{o.profesionalId}</Text>
                <Text style={styles.offerAmount}>${o.monto}</Text>
              </View>

              {trabajo.urgente ? (
                <Text style={styles.offerUrgentTotal}>
                  Total urgente (x1.5): ${(Number(o.monto) * URGENTE_MULTIPLIER).toFixed(2)}
                </Text>
              ) : null}

              <Text style={styles.offerRating}>
                Calificacion: {promedios[o.profesionalId] ?? 'Sin valoraciones'}
              </Text>

              {comentarios[o.profesionalId]?.slice(0, 2).map((c, i) => (
                <Text key={i} style={styles.offerComment}>
                  "{c}"
                </Text>
              ))}

              <Pressable
                onPress={() =>
                  router.push(`/cliente/profesional/${o.profesionalId}` as any)
                }
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Ver perfil</Text>
              </Pressable>

              <PrimaryButton
                label="Aceptar oferta"
                onPress={() => handleAceptarOferta(o.id)}
                disabled={accionando}
              />
            </View>
          ))}
        </View>
      ) : null}

      {(trabajo.estado === ESTADOS.EN_PROGRESO ||
        trabajo.estado === ESTADOS.PENDIENTE_CONFIRMACION) &&
      ofertaAceptada ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Trabajo en curso</Text>

          <Text style={styles.offerAmount}>${ofertaAceptada.monto}</Text>
          {trabajo.urgente ? (
            <Text style={styles.offerUrgentTotal}>
              Total urgente (x1.5):{' '}
              ${(Number(ofertaAceptada.monto) * URGENTE_MULTIPLIER).toFixed(2)}
            </Text>
          ) : null}

          <PrimaryButton
            label="Abrir chat"
            onPress={() =>
              router.push({
                pathname: '/chat/[trabajoId]' as any,
                params: { trabajoId: String(trabajo.id) },
              })
            }
          />

          <PrimaryButton
            label="Finalizar trabajo"
            onPress={handleFinalizarTrabajo}
            disabled={accionando}
          />
        </View>
      ) : null}

      {trabajo.estado === ESTADOS.FINALIZADO && !trabajo.valoracion ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Valorar profesional</Text>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setPuntaje(n)}
                style={[styles.starChip, puntaje === n && styles.starChipActive]}
              >
                <Ionicons
                  name="star"
                  size={14}
                  color={puntaje === n ? '#FFFFFF' : '#F59E0B'}
                />
                <Text style={[styles.starChipText, puntaje === n && styles.starChipTextActive]}>
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Comentario"
            placeholderTextColor="#7B93B7"
            value={comentario}
            onChangeText={setComentario}
            style={styles.input}
            multiline
          />

          <PrimaryButton
            label="Enviar valoracion"
            onPress={handleEnviarValoracion}
            disabled={accionando}
          />
        </View>
      ) : null}

      {trabajo.estado === ESTADOS.FINALIZADO && trabajo.valoracion ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Valoracion</Text>
          <Text style={styles.emptyText}>Ya fue valorado.</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
}) {
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

function mapEstado(estado: string) {
  if (estado === 'PENDIENTE') {
    return { label: 'Publicado', bg: '#DBEAFE', text: '#1E3A8A' }
  }
  if (estado === 'ASIGNADO') {
    return { label: 'Asignado', bg: '#E0E7FF', text: '#3730A3' }
  }
  if (estado === 'PENDIENTE_CONFIRMACION') {
    return { label: 'Pendiente de confirmacion', bg: '#FEF3C7', text: '#92400E' }
  }
  if (estado === 'FINALIZADO') {
    return { label: 'Finalizado', bg: '#DCFCE7', text: '#166534' }
  }
  return { label: estado, bg: '#E5E7EB', text: '#374151' }
}
