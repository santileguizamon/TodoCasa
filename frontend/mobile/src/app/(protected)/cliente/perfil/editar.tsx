import { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import { useAuth } from '../../../../context/auth-context'
import { actualizarDireccion, actualizarUsuario } from '@/src/api/users.api'
import { buscarDirecciones } from '../../../../api/geocoding.api'
import { perfilClienteEditarStyles as styles } from '../../../../styles/perfil-cliente-editar.styles'

export default function ClientePerfilEditar() {
  const router = useRouter()
  const { user, token, refreshUser } = useAuth()

  const [nombre, setNombre] = useState(user?.nombre || '')
  const [email, setEmail] = useState(user?.email || '')
  const [direccion, setDireccion] = useState(user?.direccion || '')
  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [sugerenciasDireccion, setSugerenciasDireccion] = useState<any[]>([])
  const [errorBusquedaDireccion, setErrorBusquedaDireccion] = useState<string | null>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!user) return null

  async function onChangeDireccion(text: string) {
    setDireccion(text)
    setErrorBusquedaDireccion(null)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = null
    }

    if (text.length < 3) {
      setSugerenciasDireccion([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await buscarDirecciones(text, {
          lat: user?.lat,
          lng: user?.lng,
          countryCode: 'ar',
        })
        setSugerenciasDireccion(Array.isArray(res) ? res : [])
      } catch (err: any) {
        setSugerenciasDireccion([])
        const raw = String(err?.message || '')
        if (raw.includes('429')) {
          setErrorBusquedaDireccion(
            'Demasiadas consultas de direccion. Espera unos segundos e intenta otra vez.',
          )
          return
        }
        setErrorBusquedaDireccion('No se pudo buscar direcciones en este momento.')
      }
    }, 350)
  }

  async function guardarCambios() {
    if (!user || loading) return

    if (!nombre.trim() || !email.trim()) {
      Alert.alert('Error', 'Nombre y email son obligatorios')
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
      setLoading(true)

      await actualizarUsuario(
        user.id,
        {
          nombre: nombre.trim(),
          email: email.trim(),
          ...(nuevaPassword ? { password: nuevaPassword } : {}),
        },
        token ?? undefined,
      )

      if (direccion.trim()) {
        await actualizarDireccion(direccion.trim(), token ?? undefined)
      }

      await refreshUser()
      setNuevaPassword('')
      setConfirmarPassword('')

      Alert.alert('Exito', 'Tus datos fueron actualizados', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ])
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Configuracion</Text>
        <Text style={styles.heroTitle}>Editar perfil</Text>
        <Text style={styles.heroSubtitle}>
          Actualiza tus datos personales, direccion y seguridad.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="person-outline" size={16} color="#1E3A8A" />
          <Text style={styles.sectionTitle}>Datos personales</Text>
        </View>

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Tu nombre"
          placeholderTextColor="#7B93B7"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Tu email"
          placeholderTextColor="#7B93B7"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="location-outline" size={16} color="#1E3A8A" />
          <Text style={styles.sectionTitle}>Direccion</Text>
        </View>

        <TextInput
          value={direccion}
          onChangeText={onChangeDireccion}
          placeholder="Ej: Av Santa Fe 1234"
          placeholderTextColor="#7B93B7"
          style={styles.input}
        />

        {sugerenciasDireccion.map((s, i) => (
          <Pressable
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
          </Pressable>
        ))}

        {!errorBusquedaDireccion &&
        direccion.trim().length >= 3 &&
        sugerenciasDireccion.length === 0 ? (
          <Text style={styles.suggestionState}>Sin resultados para esa busqueda</Text>
        ) : null}

        {errorBusquedaDireccion ? (
          <Text style={styles.suggestionState}>{errorBusquedaDireccion}</Text>
        ) : null}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="lock-closed-outline" size={16} color="#1E3A8A" />
          <Text style={styles.sectionTitle}>Seguridad</Text>
        </View>

        <Text style={styles.securityHint}>
          Completa ambos campos solo si quieres cambiar la contrasena.
        </Text>

        <Text style={styles.label}>Nueva contrasena</Text>
        <TextInput
          value={nuevaPassword}
          onChangeText={setNuevaPassword}
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 14 }]}>Confirmar contrasena</Text>
        <TextInput
          value={confirmarPassword}
          onChangeText={setConfirmarPassword}
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <Pressable
        disabled={loading}
        onPress={guardarCambios}
        style={[styles.button, loading && { opacity: 0.7 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Guardar cambios</Text>
        )}
      </Pressable>
    </ScrollView>
  )
}
