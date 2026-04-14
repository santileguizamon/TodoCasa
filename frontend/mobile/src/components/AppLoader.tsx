import { ActivityIndicator, View } from 'react-native'

export function AppLoader() {
  return (
    <View
      style={{
        marginTop: 40,
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  )
}
