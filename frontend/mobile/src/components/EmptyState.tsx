import { View, Text } from 'react-native'

export function EmptyState({ text }: { text: string }) {
  return (
    <View
      style={{
        padding: 24,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#666' }}>{text}</Text>
    </View>
  )
}
