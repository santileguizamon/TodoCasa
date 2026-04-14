import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'

import { obtenerProfesional } from '../../../../api/profesionales.api'
import {
  obtenerValoracionesPorProfesional,
  obtenerPromedioProfesional,
} from '../../../../api/valoraciones.api'

import { COLORS, RADIUS, SPACING } from '../../../../theme'

export default function PerfilProfesionalCliente() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [profesional, setProfesional] = useState<any>(null)
  const [valoraciones, setValoraciones] = useState<any[]>([])
  const [promedio, setPromedio] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function cargarPerfil() {
      try {
        const [prof, vals, prom] = await Promise.all([
          obtenerProfesional(Number(id)),
          obtenerValoracionesPorProfesional(Number(id)),
          obtenerPromedioProfesional(Number(id)),
        ])

        setProfesional(prof)
        setValoraciones(Array.isArray(vals) ? vals : [])
        setPromedio(prom.promedio ?? null)
      } catch (err) {
        console.log('Error cargando perfil:', err)
      } finally {
        setLoading(false)
      }
    }

    cargarPerfil()
  }, [id])

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />
  }

  if (!profesional) return null

  const nombre = profesional.usuario?.nombre ?? 'Profesional'
  const fotoUrl = profesional.usuario?.fotoUrl

  return (
    <ScrollView style={styles.container}>
      {/* ================= HEADER ================= */}

      <View style={styles.header}>
        {fotoUrl ? (
          <Image source={{ uri: fotoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {nombre.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={styles.nombre}>{nombre}</Text>

        <Text style={styles.rating}>
          ⭐ {promedio ? promedio.toFixed(1) : 'Sin valoraciones'}{' '}
          {valoraciones.length > 0 && `(${valoraciones.length})`}
        </Text>
      </View>

      {/* ================= DESCRIPCIÓN ================= */}

      {profesional.descripcion && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Sobre el profesional
          </Text>
          <Text style={styles.sectionText}>
            {profesional.descripcion}
          </Text>
        </View>
      )}

      {/* ================= ESPECIALIDADES ================= */}

      {profesional.especialidades?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Especialidades
          </Text>
          <Text style={styles.sectionText}>
            {profesional.especialidades
              .map((e: any) => e.nombre)
              .join(', ')}
          </Text>
        </View>
      )}

      {/* ================= OPINIONES ================= */}

      <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
        Opiniones de clientes
      </Text>

      <FlatList
        data={valoraciones}
        scrollEnabled={false}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={{ marginTop: SPACING.sm }}>
            Este profesional aún no tiene valoraciones
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <Text style={styles.reviewScore}>
              ⭐ {item.puntaje}
            </Text>

            {item.comentario && (
              <Text style={styles.reviewComment}>
                {item.comentario}
              </Text>
            )}
          </View>
        )}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: SPACING.sm,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarInitial: {
    fontSize: 42,
    color: '#fff',
    fontWeight: 'bold',
  },
  nombre: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  rating: {
    marginTop: 4,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionText: {
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  reviewCard: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
  },
  reviewScore: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewComment: {
    color: COLORS.textSecondary,
  },
})
