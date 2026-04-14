import {
  ScrollView,
  View,
  Text,
  Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'

import { useAuth } from '../../../context/auth-context'
import { useLocation } from '../../../hooks/useLocation'
import { actualizarUbicacion } from '../../../api/users.api'
import { obtenerMisTrabajosCliente } from '../../../api/trabajos.api'
import { dashboardStyles as styles } from '../../../styles/dashboard.styles'

export default function ClienteDashboard() {
  const { user, logout, token } = useAuth()
  const { location } = useLocation()
  const [trabajos, setTrabajos] = useState<any[]>([])

  useEffect(() => {
    if (!location || !token) return

    actualizarUbicacion(location.latitude, location.longitude, token).catch(
      (err) => console.log('Error enviando ubicacion:', err),
    )
  }, [location, token])

  const cargarPendientes = useCallback(async () => {
    try {
      const res = await obtenerMisTrabajosCliente()
      setTrabajos(Array.isArray(res) ? res : [])
    } catch {
      setTrabajos([])
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      cargarPendientes()
    }, [cargarPendientes]),
  )

  if (!user) return null

  const ofertasPendientes = useMemo(
    () =>
      trabajos.filter(
        (t) =>
          t.estado === 'PENDIENTE' &&
          Array.isArray(t.ofertas) &&
          t.ofertas.length > 0,
      ).length,
    [trabajos],
  )

  const confirmacionesPendientes = useMemo(
    () =>
      trabajos.filter((t) => t.estado === 'PENDIENTE_CONFIRMACION').length,
    [trabajos],
  )

  const valoracionesPendientes = useMemo(
    () =>
      trabajos.filter(
        (t) => t.estado === 'FINALIZADO' && !t.valoracion,
      ).length,
    [trabajos],
  )

  const sinUbicacion =
    !user.direccion &&
    (typeof user.lat !== 'number' || typeof user.lng !== 'number')
  const sinPendientes =
    ofertasPendientes === 0 &&
    confirmacionesPendientes === 0 &&
    valoracionesPendientes === 0

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hola, {user.nombre}</Text>
        <Text style={styles.headerSubtitle}>
          Publica trabajos, revisa propuestas y coordina todo desde un solo lugar.
        </Text>
      </View>

      <Pressable
        onPress={() => router.push('/cliente/nuevo' as any)}
        style={styles.ctaMain}
      >
        <View style={styles.ctaRow}>
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.ctaMainTitle}>Publicar trabajo</Text>
        </View>
        <Text style={styles.ctaMainText}>Recibi presupuestos en minutos</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/cliente/misTrabajos' as any)}
        style={[styles.pendingCard, sinPendientes && styles.pendingCardNeutral]}
      >
        <View style={styles.titleRow}>
          <Ionicons
            name="time-outline"
            size={14}
            color={sinPendientes ? '#1E3A8A' : '#92400E'}
          />
          <Text
            style={[
              styles.pendingTitle,
              sinPendientes && styles.pendingTitleNeutral,
            ]}
          >
            Acciones pendientes
          </Text>
        </View>
        {ofertasPendientes > 0 ? (
          <Text style={styles.pendingText}>
            {ofertasPendientes} trabajo(s) con ofertas por revisar
          </Text>
        ) : null}
        {confirmacionesPendientes > 0 ? (
          <Text style={styles.pendingText}>
            {confirmacionesPendientes} trabajo(s) para confirmar finalizacion
          </Text>
        ) : null}
        {valoracionesPendientes > 0 ? (
          <Text style={styles.pendingText}>
            {valoracionesPendientes} trabajo(s) para valorar
          </Text>
        ) : null}
        {sinPendientes ? (
          <Text style={styles.pendingEmptyText}>No tenes acciones pendientes</Text>
        ) : null}
      </Pressable>

      {sinUbicacion ? (
        <Pressable
          onPress={() => router.push('/cliente/perfil' as any)}
          style={styles.locationWarningCard}
        >
          <View style={styles.titleRow}>
            <Ionicons name="location-outline" size={14} color="#1E3A8A" />
            <Text style={styles.locationWarningTitle}>Falta tu ubicacion</Text>
          </View>
          <Text style={styles.locationWarningText}>
            Agrega tu direccion en perfil para mejorar coincidencias de trabajos.
          </Text>
        </Pressable>
      ) : null}

      <View style={styles.listCard}>
        <Pressable
          onPress={() => router.push('/cliente/misTrabajos' as any)}
          style={styles.listItem}
        >
          <View style={styles.listLeft}>
            <Ionicons name="briefcase" size={16} color="#10386E" />
            <View>
              <Text style={styles.listTitle}>Mis trabajos</Text>
              <Text style={styles.listSubtitle}>Estado y seguimiento</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          onPress={() => router.push('/cliente/chats' as any)}
          style={styles.listItem}
        >
          <View style={styles.listLeft}>
            <Ionicons name="chatbubble" size={16} color="#10386E" />
            <View>
              <Text style={styles.listTitle}>Chats</Text>
              <Text style={styles.listSubtitle}>Conversaciones activas</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </Pressable>
        <View style={styles.divider} />
        <Pressable
          onPress={() => router.push('/cliente/perfil' as any)}
          style={styles.listItem}
        >
          <View style={styles.listLeft}>
            <Ionicons name="person-circle-outline" size={18} color="#10386E" />
            <View>
              <Text style={styles.listTitle}>Mi perfil</Text>
              <Text style={styles.listSubtitle}>Datos personales y direccion</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </Pressable>
      </View>

      <Pressable onPress={logout} style={styles.logoutLink}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </Pressable>
    </ScrollView>
  )
}
