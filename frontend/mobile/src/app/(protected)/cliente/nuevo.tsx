import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import { crearTrabajo } from '../../../api/trabajos.api'
import { obtenerEspecialidades } from '../../../api/profesionales.api'
import { useAuth } from '../../../context/auth-context'
import { buscarDirecciones } from '../../../api/geocoding.api'
import { useLocation } from '../../../hooks/useLocation'
import {
  nuevoTrabajoColors,
  nuevoTrabajoStyles as styles,
} from '../../../styles/nuevo-trabajo.styles'

export default function NuevoTrabajo() {
  const router = useRouter()
  const { user } = useAuth()
  const { location, refreshLocation } = useLocation()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [direccion, setDireccion] = useState(user?.direccion || '')
  const [usarMiDireccion, setUsarMiDireccion] = useState(Boolean(user?.direccion))

  const [rangoMin, setRangoMin] = useState('1000')
  const [rangoMax, setRangoMax] = useState('5000')
  const [urgente, setUrgente] = useState(false)
  const [publicando, setPublicando] = useState(false)

  const [sugerencias, setSugerencias] = useState<any[]>([])
  const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<
    Array<{ id: number; nombre: string }>
  >([])
  const [especialidadesSeleccionadas, setEspecialidadesSeleccionadas] = useState<number[]>([])
  const [coordsDireccion, setCoordsDireccion] = useState<{ lat: number; lng: number } | null>(
    null,
  )

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

  async function submit() {
    if (!user?.id || publicando) return

    if (!titulo.trim() || !descripcion.trim()) {
      Alert.alert('Falta info', 'Completa titulo y descripcion')
      return
    }

    if (especialidadesSeleccionadas.length === 0 || especialidadesSeleccionadas.length > 2) {
      Alert.alert('Especialidades', 'Selecciona 1 o 2 especialidades para el trabajo')
      return
    }

    const direccionFinal = (usarMiDireccion ? user?.direccion : direccion)?.trim()

    if (!direccionFinal) {
      Alert.alert('Falta ubicacion', 'Ingresa una direccion')
      return
    }

    try {
      setPublicando(true)
      let lat: number | undefined
      let lng: number | undefined

      if (location) {
        lat = location.latitude
        lng = location.longitude
      } else if (typeof user?.lat === 'number' && typeof user?.lng === 'number') {
        lat = user.lat
        lng = user.lng
      } else if (coordsDireccion) {
        lat = coordsDireccion.lat
        lng = coordsDireccion.lng
      }

      if ((lat == null || lng == null) && direccionFinal) {
        const posibles = await buscarDirecciones(direccionFinal)
        if (Array.isArray(posibles) && posibles.length > 0) {
          const primera = posibles[0]
          if (typeof primera?.lat === 'number' && typeof primera?.lng === 'number') {
            lat = primera.lat
            lng = primera.lng
          }
        }
      }

      const categoriaSeleccionada = especialidadesDisponibles
        .filter((e) => especialidadesSeleccionadas.includes(e.id))
        .map((e) => e.nombre)
        .join(', ')

      const creado = await crearTrabajo({
        titulo,
        descripcion,
        categoria: categoriaSeleccionada,
        rangoMin: Number(rangoMin),
        rangoMax: Number(rangoMax),
        urgente,
        clienteId: user.id,
        direccion: direccionFinal,
        lat,
        lng,
      })

      if (!creado?.id) {
        throw new Error('No se pudo confirmar el alta del trabajo')
      }

      setTitulo('')
      setDescripcion('')
      setRangoMin('1000')
      setRangoMax('5000')
      setUrgente(false)
      setSugerencias([])
      setCoordsDireccion(null)
      setEspecialidadesSeleccionadas([])
      setDireccion(user?.direccion || '')
      setUsarMiDireccion(Boolean(user?.direccion))

      router.replace('/cliente/misTrabajos' as any)
    } catch (err) {
      Alert.alert('Error', getPublishErrorMessage(err))
    } finally {
      setPublicando(false)
    }
  }

  async function onBuscarDireccion(text: string) {
    setDireccion(text)
    setCoordsDireccion(null)

    if (text.length < 3) {
      setSugerencias([])
      return
    }

    try {
      const res = await buscarDirecciones(text, {
        lat: location?.latitude ?? user?.lat ?? null,
        lng: location?.longitude ?? user?.lng ?? null,
        countryCode: 'ar',
      })
      setSugerencias(Array.isArray(res) ? res : [])
    } catch {
      setSugerencias([])
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroKicker}>Publicacion</Text>
          <Text style={styles.heroTitle}>Nuevo trabajo</Text>
          <Text style={styles.heroSubtitle}>
            Completa los datos y recibe propuestas de profesionales cercanos.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="construct-outline" size={16} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Servicio</Text>
          </View>

          <Text style={styles.label}>Titulo</Text>
          <TextInput
            placeholder="Ej: Arreglar calefon"
            placeholderTextColor="#7B93B7"
            value={titulo}
            onChangeText={setTitulo}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Descripcion</Text>
          <TextInput
            placeholder="Explica el problema..."
            placeholderTextColor="#7B93B7"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            style={[styles.input, styles.inputMultiline]}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Especialidades (1 o 2)</Text>
          {especialidadesDisponibles.length === 0 ? (
            <Text style={styles.helperText}>No hay especialidades cargadas por admin todavia.</Text>
          ) : (
            <View style={styles.chipsWrap}>
              {especialidadesDisponibles.map((esp) => {
                const selected = especialidadesSeleccionadas.includes(esp.id)
                const maxReached = !selected && especialidadesSeleccionadas.length >= 2
                return (
                  <Pressable
                    key={esp.id}
                    onPress={() => {
                      setEspecialidadesSeleccionadas((prev) => {
                        if (prev.includes(esp.id)) return prev.filter((id) => id !== esp.id)
                        if (prev.length >= 2) return prev
                        return [...prev, esp.id]
                      })
                    }}
                    style={[
                      styles.chip,
                      selected && styles.chipSelected,
                      maxReached && styles.chipDisabled,
                    ]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {esp.nombre}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="cash-outline" size={16} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Presupuesto</Text>
          </View>

          <Text style={styles.label}>Rango estimado</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="Min"
              placeholderTextColor="#7B93B7"
              keyboardType="numeric"
              value={rangoMin}
              onChangeText={setRangoMin}
              style={[styles.input, styles.col]}
            />
            <TextInput
              placeholder="Max"
              placeholderTextColor="#7B93B7"
              keyboardType="numeric"
              value={rangoMax}
              onChangeText={setRangoMax}
              style={[styles.input, styles.col]}
            />
          </View>

          <View style={styles.urgenteRow}>
            <View>
              <Text style={styles.urgenteTitle}>Trabajo urgente</Text>
              <Text style={styles.urgenteSubtitle}>Se destaca en exploracion</Text>
            </View>
            <Switch
              value={urgente}
              onValueChange={setUrgente}
              trackColor={{ true: nuevoTrabajoColors.primary }}
            />
          </View>

          {urgente ? (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                Al aceptar una oferta en este trabajo urgente, se aplicara un recargo automatico x1.5.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location-outline" size={16} color="#1E3A8A" />
            <Text style={styles.sectionTitle}>Ubicacion</Text>
          </View>

          {user?.direccion ? (
            <Pressable onPress={() => setUsarMiDireccion(!usarMiDireccion)}>
              <Text style={styles.linkText}>
                {usarMiDireccion
                  ? 'Usando direccion del perfil (tocar para cambiar)'
                  : 'Usar direccion del perfil'}
              </Text>
            </Pressable>
          ) : null}

          {!usarMiDireccion || !user?.direccion ? (
            <>
              <Pressable
                onPress={() => {
                  refreshLocation().catch(() => undefined)
                }}
              >
                <Text style={[styles.linkText, { marginBottom: 10 }]}>Usar ubicacion actual</Text>
              </Pressable>

              <TextInput
                value={direccion}
                onChangeText={onBuscarDireccion}
                placeholder="Direccion del trabajo"
                placeholderTextColor="#7B93B7"
                style={styles.input}
              />

              {sugerencias.map((s, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    setDireccion(s.direccion)
                    if (typeof s.lat === 'number' && typeof s.lng === 'number') {
                      setCoordsDireccion({ lat: s.lat, lng: s.lng })
                    }
                    setSugerencias([])
                  }}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{s.direccion}</Text>
                </Pressable>
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={submit}
          disabled={publicando}
          style={[styles.submitButton, publicando && { opacity: 0.7 }]}
        >
          <Text style={styles.submitButtonText}>
            {publicando ? 'Publicando...' : 'Publicar trabajo'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

function getPublishErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const raw = err.message?.trim()
    if (!raw) return 'No se pudo publicar el trabajo'

    try {
      const parsed = JSON.parse(raw) as {
        message?: string | string[]
      }
      if (Array.isArray(parsed?.message) && parsed.message.length > 0) {
        return parsed.message.join(', ')
      }
      if (typeof parsed?.message === 'string' && parsed.message) {
        return parsed.message
      }
    } catch {
      // texto plano
    }

    return raw
  }
  return 'No se pudo publicar el trabajo'
}
