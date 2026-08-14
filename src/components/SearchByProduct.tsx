import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { rf, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';

// Matched to the real product_type values in the scored catalog (/recommend).
// "Eye Cream" and "Lip Balm" have no matching product_type there yet — they'll
// start working on their own once that data exists, rather than faking it.
const CATEGORIES = [
  { label: 'Cleanser', productType: 'Cleanser', image: require('../assets/Shopbyproducts/p1.png') },
  { label: 'Toner', productType: 'Toner', image: require('../assets/Shopbyproducts/p2.png') },
  { label: 'Serum', productType: 'Serum', image: require('../assets/Shopbyproducts/p3.png') },
  { label: 'Moisturiser', productType: 'Moisturiser', image: require('../assets/Shopbyproducts/p4.png') },
  { label: 'Mask', productType: 'Mask', image: require('../assets/Shopbyproducts/p5.png') },
  { label: 'Eye Cream', productType: 'Eye Cream', image: require('../assets/Shopbyproducts/p6.png') },
  { label: 'Lip Balm', productType: 'Lip Balm', image: require('../assets/Shopbyproducts/p7.png') },
];

type Props = {
  onSelect: (productType: string) => void;
};

export function SearchByProduct({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search by product</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {CATEGORIES.map(item => (
          <TouchableOpacity
            key={item.productType}
            style={styles.card}
            onPress={() => onSelect(item.productType)}
            activeOpacity={0.85}
          >
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            <View style={styles.labelWrap}>
              {/* <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text> */}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
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
    width: rw(108),
    height: rw(130),
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  labelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '42%',
    alignItems: 'center',
    paddingHorizontal: rw(4),
  },
  label: {
    fontSize: rf(12),
    fontWeight: '800',
    color: colors.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
