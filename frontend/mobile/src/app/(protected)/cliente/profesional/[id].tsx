import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  Alert,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { obtenerProfesional } from '../../../../api/profesionales.api'
import {
  obtenerValoracionesPorProfesional,
  obtenerPromedioProfesional,
} from '../../../../api/valoraciones.api'

import { obtenerResumenComentarios } from '../../../../lib/resumenComentaraios'
import { AppLoader } from '../../../../components/AppLoader'
import { perfilProfesionalPublicoStyles as styles } from '../../../../styles/perfil-profesional-publico.styles'

export default function PerfilProfesionalPublico() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [profesional, setProfesional] = useState<any>(null)
  const [valoraciones, setValoraciones] = useState<any[]>([])
  const [promedio, setPromedio] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    setLoading(true)

    Promise.all([
      obtenerProfesional(Number(id)),
      obtenerValoracionesPorProfesional(Number(id)),
      obtenerPromedioProfesional(Number(id)),
    ])
      .then(([profRes, valsRes, promRes]) => {
        setProfesional(profRes)
        setValoraciones(Array.isArray(valsRes) ? valsRes : [])
        setPromedio(promRes?.promedio ?? null)
      })
      .catch(() =>
        Alert.alert(
          'Error',
          'No se pudo cargar el perfil del profesional'
        )
      )
      .finally(() => setLoading(false))
  }, [id])

  const resumenComentarios = useMemo(() => {
    return obtenerResumenComentarios(valoraciones, 3)
  }, [valoraciones])

  if (loading) return <AppLoader />

  if (!profesional) {
    return (
      <View style={styles.notFoundWrap}>
        <Text style={styles.notFoundText}>No se encontro el profesional</Text>
      </View>
    )
  }

  const nombre = profesional.usuario?.nombre ?? 'Profesional'
  const email = profesional.usuario?.email ?? 'Sin email'
  const verificado = profesional.usuario?.verificado
  const direccion = profesional.usuario?.direccion ?? 'Sin direccion configurada'
  const especialidadesTexto =
    profesional.especialidades?.length > 0
      ? profesional.especialidades.map((e: any) => e.nombre).join(', ')
      : 'Sin especialidades configuradas'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Perfil profesional</Text>
        <Text style={styles.heroTitle}>{nombre}</Text>
        <Text style={styles.heroSubtitle}>{email}</Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroPill}>
            <Ionicons name="star-outline" size={14} color="#1D4ED8" />
            <Text style={styles.heroPillText}>
              {promedio !== null ? `★ ${promedio.toFixed(1)}` : 'Sin valoraciones'}
            </Text>
          </View>
          <View style={styles.heroPill}>
            <Ionicons name="checkmark-done-outline" size={14} color="#1D4ED8" />
            <Text style={styles.heroPillText}>
              {verificado ? 'Profesional verificado' : 'Verificacion pendiente'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informacion profesional</Text>

        <Text style={styles.infoLabel}>Descripcion</Text>
        <Text style={styles.sectionText}>
          {profesional.descripcion ||
            'Este profesional aun no agrego una descripcion.'}
        </Text>

        <View style={styles.infoDivider} />

        <Text style={styles.infoLabel}>Ubicacion</Text>
        <Text style={styles.sectionText}>{direccion}</Text>

        <View style={styles.infoDivider} />

        <Text style={styles.infoLabel}>Especialidades</Text>
        <Text style={styles.sectionText}>{especialidadesTexto}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Opiniones de clientes</Text>

        {resumenComentarios.length === 0 && (
          <Text style={styles.emptyText}>
            Todavia no hay comentarios escritos
          </Text>
        )}

        {resumenComentarios.map((v, i) => (
          <View key={i} style={styles.commentCard}>
            <Text style={styles.commentRating}>★ {v.puntaje}</Text>
            <Text style={styles.commentText}>
              "{v.comentario || 'Sin comentario'}"
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
