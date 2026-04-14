import { Redirect, Slot } from 'expo-router'
import { useAuth } from '../../context/auth-context'
import { ActivityIndicator, View, Text } from 'react-native'

export default function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F6F7FB',
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>
          Verificando acceso...
        </Text>
      </View>
    )
  }

  if (!user) {
    return <Redirect href={'/(public)/login' as any} />
  }

  return <Slot />
}
