import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native'

import {
  obtenerValoracionesPorProfesional,
  obtenerPromedioProfesional,
} from '../../../../api/valoraciones.api'

import { useAuth } from '../../../../context/auth-context'

type Valoracion = {
  id: number
  puntaje: number
  comentario?: string
}

export default function ValoracionesProfesionalScreen() {
  const { user } = useAuth()
  const profesionalId = user?.id

  const [valoraciones, setValoraciones] = useState<Valoracion[]>([])
  const [promedio, setPromedio] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profesionalId) return

    async function cargarDatos() {
      try {
        setLoading(true)

        const [valsRes, promRes] = await Promise.all([
          obtenerValoracionesPorProfesional(profesionalId as any),
          obtenerPromedioProfesional(profesionalId as any),
        ])

        setValoraciones(Array.isArray(valsRes) ? valsRes : [])
        setPromedio(promRes.promedio ?? null)
      } catch {
        Alert.alert(
          'Error',
          'No se pudieron cargar las valoraciones'
        )
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [profesionalId])

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />
  }

  return (
    <View style={{ padding: 16 }}>
      {/* ================= TÍTULO ================= */}
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
        Mis valoraciones
      </Text>

      <Text style={{ color: '#666', marginTop: 4 }}>
        Opiniones que dejaron los clientes sobre tu trabajo
      </Text>

      {/* ================= RESUMEN ================= */}
      <View
        style={{
          marginTop: 20,
          padding: 12,
          borderWidth: 1,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          ⭐ Promedio:{' '}
          {promedio !== null
            ? promedio.toFixed(1)
            : '—'}
        </Text>

        <Text style={{ marginTop: 4 }}>
          Total de valoraciones: {valoraciones.length}
        </Text>
      </View>

      {/* ================= LISTA ================= */}
      {valoraciones.length === 0 ? (
        <Text style={{ marginTop: 24, color: '#555' }}>
          Todavía no recibiste valoraciones.
        </Text>
      ) : (
        <FlatList
          style={{ marginTop: 24 }}
          data={valoraciones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>
                ⭐ {item.puntaje}
              </Text>

              {item.comentario ? (
                <Text
                  style={{
                    marginTop: 6,
                    fontStyle: 'italic',
                    color: '#555',
                  }}
                >
                  “{item.comentario}”
                </Text>
              ) : (
                <Text
                  style={{
                    marginTop: 6,
                    color: '#999',
                  }}
                >
                  Sin comentario
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  )
}

