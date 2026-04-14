import { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'

import { useAuth } from '../../../../context/auth-context'
import {
  obtenerMiPerfilProfesional,
  actualizarPerfilProfesional,
  obtenerEspecialidades,
} from '../../../../api/profesionales.api'
import { buscarDirecciones } from '../../../../api/geocoding.api'
import {
  actualizarDireccion,
  actualizarUbicacion,
  actualizarUsuario,
} from '../../../../api/users.api'

import { useLocation } from '../../../../hooks/useLocation'
import { perfilProfesionalEditarStyles as styles } from '../../../../styles/perfil-profesional-editar.styles'

type EspecialidadItem = { id: number; nombre: string }

const ESPECIALIDADES_FALLBACK: EspecialidadItem[] = [
  { id: 1, nombre: 'Electricidad' },
  { id: 2, nombre: 'Plomeria' },
  { id: 3, nombre: 'Pintura' },
]

export default function EditarPerfilProfesional() {
  const router = useRouter()
  const { user, token, refreshUser } = useAuth()
  const { location } = useLocation()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')

  const [especialidades, setEspecialidades] = useState<number[]>([])
  const [especialidadesDisponibles, setEspecialidadesDisponibles] =
    useState<EspecialidadItem[]>(ESPECIALIDADES_FALLBACK)
  const [usaEspecialidadesBackend, setUsaEspecialidadesBackend] =
    useState(false)
  const [ubicacionSincronizada, setUbicacionSincronizada] = useState(false)

  const [sugerenciasDireccion, setSugerenciasDireccion] = useState<any[]>([])
  const [buscandoDireccion, setBuscandoDireccion] = useState(false)
  const [errorBusquedaDireccion, setErrorBusquedaDireccion] = useState<string | null>(null)

  async function cargarDatos() {
    try {
      setLoading(true)

      const [perfil, espRes] = await Promise.all([
        obtenerMiPerfilProfesional(),
        obtenerEspecialidades().catch(() => []),
      ])

      const lista = Array.isArray(espRes) ? espRes : []
      if (lista.length > 0) {
        setEspecialidadesDisponibles(lista)
        setUsaEspecialidadesBackend(true)
      } else {
        setEspecialidadesDisponibles(ESPECIALIDADES_FALLBACK)
        setUsaEspecialidadesBackend(false)
      }

      setNombre(perfil.usuario?.nombre || '')
      setDireccion(perfil.usuario?.direccion || '')
      setDescripcion(perfil.descripcion || '')
      setEspecialidades(perfil.especialidades?.map((e: any) => e.id) || [])
    } catch {
      Alert.alert('Error', 'No se pudo cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (!location || !token || ubicacionSincronizada) return
    const currentLocation = location
    const authToken = token ?? undefined

    async function sincronizarUbicacion() {
      try {
        await actualizarUbicacion(
          currentLocation.latitude,
          currentLocation.longitude,
          authToken,
        )

        const rev = await Location.reverseGeocodeAsync({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        })

        const item = rev?.[0]
        if (item) {
          const calle = item.street || ''
          const numero = item.streetNumber || ''
          const ciudad = item.city || item.subregion || ''
          const pais = item.country || ''
          const dir = [`${calle}${numero ? ` ${numero}` : ''}`.trim(), ciudad, pais]
            .filter(Boolean)
            .join(', ')

          if (dir && !direccion.trim()) {
            setDireccion(dir)
          }
        }

        setUbicacionSincronizada(true)
      } catch {
        setUbicacionSincronizada(false)
      }
    }

    sincronizarUbicacion()
  }, [location, token, ubicacionSincronizada, direccion])

  function toggleEspecialidad(id: number) {
    setEspecialidades((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    )
  }

  async function onDireccionChange(text: string) {
    setDireccion(text)
    setErrorBusquedaDireccion(null)

    if (text.length < 3) {
      setSugerenciasDireccion([])
      setBuscandoDireccion(false)
      return
    }

    try {
      setBuscandoDireccion(true)
      const res = await buscarDirecciones(text, {
        lat: location?.latitude ?? user?.lat ?? null,
        lng: location?.longitude ?? user?.lng ?? null,
        countryCode: 'ar',
      })
      setSugerenciasDireccion(Array.isArray(res) ? res : [])
    } catch {
      setSugerenciasDireccion([])
      setErrorBusquedaDireccion('No se pudo buscar direcciones. Revisa tu conexion.')
    } finally {
      setBuscandoDireccion(false)
    }
  }

  async function guardarCambios() {
    if (!user || saving) return

    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio')
      return
    }

    if (nuevaPassword || confirmarPassword) {
      if (nuevaPassword.length < 6) {
        Alert.alert('Error', 'La nueva contrasena debe tener al menos 6 caracteres')
        return
      }
      if (nuevaPassword !== confirmarPassword) {
        Alert.alert('Error', 'Las contrasenas no coinciden')
        return
      }
    }

    try {
      setSaving(true)

      await actualizarUsuario(
        user.id,
        {
          nombre: nombre.trim(),
          ...(nuevaPassword ? { password: nuevaPassword } : {}),
        },
        token ?? undefined,
      )

      const payload: {
        descripcion?: string
        id_especialidades?: number[]
      } = {
        descripcion,
      }

      if (usaEspecialidadesBackend) {
        payload.id_especialidades = especialidades
      }

      await actualizarPerfilProfesional(payload, token ?? undefined)

      let huboAviso = false
      if (direccion.trim()) {
        try {
          await actualizarDireccion(direccion.trim(), token ?? undefined)
        } catch {
          huboAviso = true
        }
      }

      await refreshUser()

      setNuevaPassword('')
      setConfirmarPassword('')

      Alert.alert(
        huboAviso ? 'Guardado parcial' : 'Exito',
        huboAviso
          ? 'Se guardo el perfil, pero no se pudo actualizar la direccion.'
          : 'Perfil actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      )
    } catch (err: any) {
      const message =
        typeof err?.message === 'string' ? err.message : 'No se pudo guardar el perfil'

      Alert.alert('Error', message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Configuracion</Text>
        <Text style={styles.heroTitle}>Editar perfil</Text>
        <Text style={styles.heroSubtitle}>
          Actualiza tus datos profesionales, ubicacion y acceso.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Datos principales</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput value={nombre} onChangeText={setNombre} style={styles.input} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Descripcion profesional</Text>
          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            style={[styles.input, styles.textArea]}
          />
        </View>

      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ubicacion</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Direccion</Text>
          <TextInput
            value={direccion}
            onChangeText={onDireccionChange}
            placeholder="Ej: Av Santa Fe 1234"
            placeholderTextColor="#7B93B7"
            style={styles.input}
          />

          {sugerenciasDireccion.map((s, i) => (
            <TouchableOpacity
              key={`${s.direccion}-${i}`}
              onPress={() => {
                setDireccion(s.direccion)
                setSugerenciasDireccion([])
              }}
              style={styles.suggestionItem}
            >
              <Text style={styles.suggestionTitle}>{s.direccion}</Text>
              {s.direccionCompleta ? (
                <Text style={styles.suggestionSubtitle}>{s.direccionCompleta}</Text>
              ) : null}
            </TouchableOpacity>
          ))}

          {buscandoDireccion ? (
            <Text style={styles.suggestionState}>Buscando direcciones...</Text>
          ) : null}
          {!buscandoDireccion && errorBusquedaDireccion ? (
            <Text style={styles.suggestionState}>{errorBusquedaDireccion}</Text>
          ) : null}
          {!buscandoDireccion &&
          !errorBusquedaDireccion &&
          direccion.trim().length >= 3 &&
          sugerenciasDireccion.length === 0 ? (
            <Text style={styles.suggestionState}>Sin resultados para esa busqueda</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Especialidades</Text>
        <View style={styles.chipsContainer}>
          {especialidadesDisponibles.map((esp) => {
            const selected = especialidades.includes(esp.id)
            return (
              <TouchableOpacity
                key={esp.id}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleEspecialidad(esp.id)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {esp.nombre}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <View style={styles.securityHintRow}>
          <Ionicons name="lock-closed-outline" size={14} color="#1D4ED8" />
          <Text style={styles.securityHint}>Completa ambos campos solo si deseas cambiar la contrasena.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nueva contrasena</Text>
          <TextInput
            value={nuevaPassword}
            onChangeText={setNuevaPassword}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.fieldNoMargin}>
          <Text style={styles.label}>Confirmar contrasena</Text>
          <TextInput
            value={confirmarPassword}
            onChangeText={setConfirmarPassword}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={guardarCambios} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
