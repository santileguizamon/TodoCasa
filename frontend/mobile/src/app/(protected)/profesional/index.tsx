import {
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../../context/auth-context'
import { useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  obtenerPromedioProfesional,
  obtenerValoracionesPorProfesional,
} from '../../../api/valoraciones.api'
import { useLocation } from '../../../hooks/useLocation'
import { actualizarUbicacion } from '../../../api/users.api'
import { obtenerMiSuscripcion } from '../../../pagos/pagos.service'
import { obtenerMisTrabajosProfesional } from '../../../api/trabajos.api'
import { profesionalDashboardStyles as styles } from '../../../styles/profesional-dashboard.styles'

function suscripcionVigente(s: any): boolean {
  if (!s?.activa) return false
  if (!s?.fechaFin) return true
  return new Date(s.fechaFin) > new Date()
}

export default function ProfesionalDashboard() {
  const { user, logout, token } = useAuth()
  const { location } = useLocation()

  const [promedio, setPromedio] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState(0)
  const [loadingReputacion, setLoadingReputacion] = useState(true)
  const [suscripcionActiva, setSuscripcionActiva] = useState<boolean | null>(
    null,
  )
  const [trabajosActivos, setTrabajosActivos] = useState(0)
  const [trabajosFinalizadosMes, setTrabajosFinalizadosMes] = useState(0)

  useEffect(() => {
    const currentUser = user
    if (!currentUser) return
    const userId = currentUser.id

    async function cargar() {
      try {
        const [prom, vals] = await Promise.all([
          obtenerPromedioProfesional(userId),
          obtenerValoracionesPorProfesional(userId),
        ])

        setPromedio(prom.promedio ?? null)
        setCantidad(Array.isArray(vals) ? vals.length : 0)
      } catch {
        setPromedio(null)
        setCantidad(0)
      } finally {
        setLoadingReputacion(false)
      }
    }

    cargar()
  }, [user])

  useEffect(() => {
    if (!location || !token) return

    actualizarUbicacion(location.latitude, location.longitude, token).catch(
      (err) => console.log('Error enviando ubicacion:', err),
    )
  }, [location, token])

  useFocusEffect(() => {
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
  })

  useFocusEffect(() => {
    if (!user || user.rol !== 'PROFESIONAL') return

    let cancelled = false

    obtenerMisTrabajosProfesional()
      .then((res) => {
        if (cancelled || !Array.isArray(res)) return
        const activos = res.filter(
          (t: any) =>
            t.estado === 'ASIGNADO' || t.estado === 'PENDIENTE_CONFIRMACION',
        ).length
        const ahora = new Date()
        const finalizadosMes = res.filter((t: any) => {
          if (t.estado !== 'FINALIZADO') return false
          const fecha =
            t.fechaFin || t.updatedAt || t.creadoEn || t.createdAt || null
          if (!fecha) return false
          const d = new Date(fecha)
          return (
            d.getMonth() === ahora.getMonth() &&
            d.getFullYear() === ahora.getFullYear()
          )
        }).length
        setTrabajosActivos(activos)
        setTrabajosFinalizadosMes(finalizadosMes)
      })
      .catch(() => {
        if (cancelled) return
        setTrabajosActivos(0)
        setTrabajosFinalizadosMes(0)
      })

    return () => {
      cancelled = true
    }
  })

  if (!user) return null

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hola, {user.nombre}</Text>
        <Text style={styles.headerSubtitle}>
          Revisa oportunidades cerca tuyo y organiza tu actividad diaria.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.titleRow}>
          <Ionicons name="star" size={14} color="#1E3A8A" style={styles.titleIcon} />
          <Text style={styles.cardTitle}>Reputacion</Text>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Promedio</Text>
            {loadingReputacion ? (
              <ActivityIndicator size="small" color="#1D4ED8" />
            ) : (
              <Text style={styles.summaryValue}>
                {promedio ? promedio.toFixed(1) : '-'}
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Opiniones</Text>
            <Text style={styles.summaryValue}>{cantidad}</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/profesional/trabajos' as any)}
        style={styles.ctaMain}
      >
        <View style={styles.ctaRow}>
          <Ionicons name="flash" size={18} color="#FFFFFF" />
          <Text style={styles.ctaMainTitle}>Ver trabajos disponibles</Text>
        </View>
        <Text style={styles.ctaMainText}>Explora oportunidades cercanas</Text>
      </Pressable>

      <View style={styles.activityCard}>
        <View style={styles.titleRow}>
          <Ionicons name="analytics" size={14} color="#0E7A56" />
          <Text style={[styles.sectionTitle, { color: '#0E7A56' }]}>
            Resumen mensual
          </Text>
        </View>
        <View style={styles.activityRow}>
          <View style={styles.activityItem}>
            <Text style={styles.activityNumber}>{trabajosActivos}</Text>
            <Text style={styles.activityLabel}>En curso</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.activityItem}>
            <Text style={styles.activityNumber}>{trabajosFinalizadosMes}</Text>
            <Text style={styles.activityLabel}>Finalizados este mes</Text>
          </View>
        </View>
      </View>

      {suscripcionActiva === false && (
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Suscripcion inactiva</Text>
          <Text style={styles.warningText}>
            Puedes explorar trabajos, pero no enviar ofertas hasta regularizarla.
          </Text>
        </View>
      )}

      <View style={styles.grid}>
        <QuickCard
          title="Mis trabajos"
          subtitle="Activos e historial"
          tone="sky"
          icon="briefcase"
          onPress={() => router.push('/profesional/misTrabajos' as any)}
        />
        <QuickCard
          title="Mi perfil"
          subtitle="Datos y servicios"
          tone="sky"
          icon="person"
          onPress={() => router.push('/profesional/perfil' as any)}
        />
      </View>

      <Pressable onPress={logout} style={styles.logoutLink}>
        <Text style={styles.logoutLinkText}>Cerrar sesion</Text>
      </Pressable>
    </ScrollView>
  )
}

function QuickCard({
  title,
  subtitle,
  tone,
  icon,
  onPress,
}: {
  title: string
  subtitle: string
  tone: 'sky' | 'mint'
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickCard,
        tone === 'sky' ? styles.quickCardSky : styles.quickCardMint,
      ]}
    >
      <View style={styles.quickTitleRow}>
        <Ionicons name={icon} size={16} color="#10386E" />
        <Text style={styles.quickTitle}>{title}</Text>
      </View>
      <Text style={styles.quickText}>{subtitle}</Text>
    </Pressable>
  )
}
