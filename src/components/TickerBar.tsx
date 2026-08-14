import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Easing,
  LayoutChangeEvent,
} from 'react-native'

const announcements = [
  'Free Registration',
  'Save Skin Profile',
  'Save Wishlist',
  'Price Drop Alert',
]

const SPEED = 40 

export default function AnnouncementBar() {
  const [contentWidth, setContentWidth] = useState(0)
  const translateX = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  useEffect(() => {
    if (contentWidth === 0) return

    const duration = (contentWidth / SPEED) * 1000

    const loop = () => {
      translateX.setValue(0)
      animationRef.current = Animated.timing(translateX, {
        toValue: -contentWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
      animationRef.current.start(({ finished }) => {
        // Reset happens the instant copy 1 fully scrolls out —
        // since copy 2 is identical, this reset is invisible.
        if (finished) loop()
      })
    }

    loop()

    return () => animationRef.current?.stop()
  }, [contentWidth, translateX])

  // Measure width of ONE set of items (not the doubled track)
  const onSingleSetLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    if (w > 0 && w !== contentWidth) setContentWidth(w)
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        {/* Copy 1 — measured to get exact content width */}
        <View style={styles.row} onLayout={onSingleSetLayout}>
          {announcements.map((item, index) => (
            <View key={`a-${item}-${index}`} style={styles.item}>
              <Text style={styles.text}>{item}</Text>
              <Text style={styles.dot}>•</Text>
            </View>
          ))}
        </View>

        {/* Copy 2 — identical, sits right after copy 1 so the loop is seamless */}
        <View style={styles.row}>
          {announcements.map((item, index) => (
            <View key={`b-${item}-${index}`} style={styles.item}>
              <Text style={styles.text}>{item}</Text>
              <Text style={styles.dot}>•</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#ca58ff',
  },
  track: {
    flexDirection: 'row',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dot: {
    color: '#fff',
    fontSize: 9,
  },
})