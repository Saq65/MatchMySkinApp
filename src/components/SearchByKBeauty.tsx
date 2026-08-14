import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { rf, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';

const BRANDS = [
  { label: 'Laneige', brand: 'Laneige', image: require('../assets/Kbeauty/k1.png') },
  { label: 'Innisfree', brand: 'Innisfree', image: require('../assets/Kbeauty/k2.png') },
  { label: 'Celimax', brand: 'Celimax', image: require('../assets/Kbeauty/k3.png') },
  { label: 'COSRX', brand: 'COSRX', image: require('../assets/Kbeauty/k4.png') },
  { label: 'Some By Mi', brand: 'SOME BY MI', image: require('../assets/Kbeauty/k5.png') },
  { label: 'The Face Shop', brand: 'The Face Shop', image: require('../assets/Kbeauty/k6.png') },
  { label: 'Anua', brand: 'Anua', image: require('../assets/Kbeauty/k7.png') },
];

type Props = {
  onSelect: (brand: string) => void;
};

export function SearchByKBeauty({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search K-Beauty</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {BRANDS.map(item => (
          <TouchableOpacity
            key={item.brand}
            style={styles.card}
            onPress={() => onSelect(item.brand)}
            activeOpacity={0.85}
          >
            <Image source={item.image} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: rf(18),
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  row: {
    gap: spacing.sm,
  },
  card: {
    width: rw(220),
    height: rw(160),
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
