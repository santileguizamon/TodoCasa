import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../../../context/auth-context'
import { perfilClienteStyles as styles } from '../../../../styles/perfil-cliente.styles'

export default function MiPerfilCliente() {
  const router = useRouter()
  const { user, logout } = useAuth()

  async function handleLogout() {
    Alert.alert('Cerrar sesion', 'Estas seguro que deseas cerrar sesion?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesion',
        style: 'destructive',
        onPress: async () => {
          await logout()
          router.replace('/(public)/login' as any)
        },
      },
    ])
  }

  if (!user) return null

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>Perfil cliente</Text>
        <Text style={styles.heroTitle}>{user.nombre}</Text>
        <Text style={styles.heroSubtitle}>{user.email}</Text>

        <View style={styles.heroMetaRow}>
          <View style={styles.heroPill}>
            <Ionicons name="person-outline" size={14} color="#1D4ED8" />
            <Text style={styles.heroPillText}>Cuenta activa</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Informacion personal</Text>

        <Text style={styles.infoLabel}>Nombre</Text>
        <Text style={styles.sectionText}>{user.nombre}</Text>

        <View style={styles.infoDivider} />

        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.sectionText}>{user.email}</Text>

        <View style={styles.infoDivider} />

        <Text style={styles.infoLabel}>Ubicacion</Text>
        <Text style={styles.sectionText}>{user.direccion || 'Sin direccion configurada'}</Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push('/cliente/perfil/editar' as any)}
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
