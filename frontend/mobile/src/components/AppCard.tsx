import { Pressable, StyleSheet, View } from 'react-native'
import { ReactNode } from 'react'

export function AppCard({
  children,
  onPress,
}: {
  children: ReactNode
  onPress?: () => void
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {children}
      </Pressable>
    )
  }

  return <View style={styles.card}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
  },
  cardPressed: {
    opacity: 0.85,
  },
})
