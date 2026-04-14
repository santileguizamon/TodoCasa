import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import { obtenerMiPerfilProfesional } from '../../../../api/profesionales.api'
import { obtenerPromedioProfesional } from '../../../../api/valoraciones.api'
import { iniciarPago } from '../../../../pagos/pagos.service'
import { useAuth } from '../../../../context/auth-context'
import { perfilProfesionalStyles as styles } from '../../../../styles/perfil-profesional.styles'

export default function MiPerfilProfesional() {
  const router = useRouter()
  const { token, logout } = useAuth()

  const [profesional, setProfesional] = useState<any>(null)
  const [promedio, setPromedio] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPago, setLoadingPago] = useState(false)

  const cargarPerfil = useCallback(async () => {
    try {
      setLoading(true)
      const prof = await obtenerMiPerfilProfesional()
      const profId = prof.idUsuario ?? prof.usuario?.id
      const prom = profId
        ? await obtenerPromedioProfesional(profId)
        : { promedio: null }

      setProfesional(prof)
      setPromedio(prom.promedio)
    } catch (error) {
      console.log('Error cargando perfil:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarPerfil()
  }, [cargarPerfil])

  useFocusEffect(
    useCallback(() => {
      cargarPerfil()
    }, [cargarPerfil])
  )

  async function handleRenovar() {
    if (!token) {
      Alert.alert('Error', 'No estas autenticado')
      return
    }

    try {
      setLoadingPago(true)
      const response = await iniciarPago(token)

      if (response?.init_point) {
        await Linking.openURL(response.init_point)
      } else {
        Alert.alert('Error', 'No se pudo iniciar el pago')
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Ocurrio un error al iniciar el pago')
    } finally {
      setLoadingPago(false)
    }
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesion', 'Estas seguro que deseas cerrar sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesion',
        style: 'destructive',
        onPress: async () => {
          await logout()
        },
      },
    ])
  }

  if (loading) {
    return <ActivityIndicator style={styles.loadingWrap} />
  }

  if (!profesional) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>
          No se pudo cargar tu perfil profesional.
        </Text>
        <TouchableOpacity
          style={[styles.primaryButton, styles.emptyButton]}
          onPress={() => router.replace('/(protected)/profesional' as any)}
        >
          <Text style={styles.primaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const estado = profesional.suscripcionEstado
  const esActiva = estado === 'ACTIVA'
  const esVencida = estado === 'VENCIDA'
  const sinSuscripcion = estado === 'SIN_SUSCRIPCION'

  const nombre = profesional.usuario?.nombre ?? 'Profesional'
  const email = profesional.usuario?.email ?? 'Sin email'
  const direccion = profesional.usuario?.direccion ?? 'Sin direccion configurada'
  const especialidadesTexto =
    profesional.especialidades?.length > 0
      ? profesional.especialidades.map((e: any) => e.nombre).join(', ')
      : 'Sin especialidades configuradas'
  const calificacionTexto = promedio ? promedio.toFixed(1) : 'Sin valoraciones'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Perfil profesional</Text>
        <Text style={styles.heroTitle}>{nombre}</Text>
        <Text style={styles.heroSubtitle}>{email}</Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroPill}>
            <Ionicons name="star-outline" size={14} color="#1D4ED8" />
            <Text style={styles.heroPillText}>{calificacionTexto}</Text>
          </View>
          <View style={styles.heroPill}>
            <Ionicons name="checkmark-done-outline" size={14} color="#1D4ED8" />
            <Text style={styles.heroPillText}>Cuenta profesional</Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.suscripcionCard,
          esActiva
            ? styles.suscripcionActiva
            : esVencida
              ? styles.suscripcionVencida
              : styles.suscripcionInactiva,
        ]}
      >
        <Text
          style={[
            styles.suscripcionTitle,
            esActiva
              ? styles.suscripcionTitleActiva
              : esVencida
                ? styles.suscripcionTitleVencida
                : styles.suscripcionTitleInactiva,
          ]}
        >
          Estado de suscripcion
        </Text>
        <Text
          style={[
            styles.suscripcionTexto,
            esActiva
              ? styles.suscripcionTextoActiva
              : esVencida
                ? styles.suscripcionTextoVencida
                : styles.suscripcionTextoInactiva,
          ]}
        >
          {esActiva && 'Suscripcion activa'}
          {esVencida && 'Suscripcion vencida'}
          {sinSuscripcion && 'Sin suscripcion activa'}
        </Text>

        {(esVencida || sinSuscripcion) && (
          <TouchableOpacity
            onPress={handleRenovar}
            disabled={loadingPago}
            style={styles.botonRenovar}
          >
            <Text style={styles.botonTexto}>
              {loadingPago ? 'Redirigiendo...' : 'Renovar suscripcion'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informacion profesional</Text>

        <Text style={styles.infoLabel}>Descripcion</Text>
        <Text style={styles.sectionText}>
          {profesional.descripcion || 'Aun no agregaste una descripcion'}
        </Text>

        <View style={styles.infoDivider} />

        <Text style={styles.infoLabel}>Ubicacion</Text>
        <Text style={styles.sectionText}>{direccion}</Text>

        <View style={styles.infoDivider} />

        <Text style={styles.infoLabel}>Especialidades</Text>
        <Text style={styles.sectionText}>{especialidadesTexto}</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/profesional/perfil/editar' as any)}
      >
        <Text style={styles.primaryButtonText}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
        <View style={styles.logoutRow}>
          <Ionicons name="log-out-outline" size={17} color="#B42318" />
          <Text style={styles.logoutTitle}>Cerrar sesion</Text>
        </View>
        <Text style={styles.logoutText}>Salir de esta cuenta</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
