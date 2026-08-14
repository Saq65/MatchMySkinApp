import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

// Matched to the real category facets from /retailer-products/facets.
const CATEGORIES = [
  { label: 'Cleanser', category: 'Cleansers', image: require('../assets/Shopbyproducts/p1.png') },
  { label: 'Toner', category: 'Shop Toners & Mists', image: require('../assets/Shopbyproducts/p2.png') },
  { label: 'Serum', category: 'Serums', image: require('../assets/Shopbyproducts/p3.png') },
  { label: 'Moisturiser', category: 'Moisturizers', image: require('../assets/Shopbyproducts/p4.png') },
  { label: 'Mask', category: 'Masks', image: require('../assets/Shopbyproducts/p5.png') },
  { label: 'Eye Cream', category: 'Eye Care', image: require('../assets/Shopbyproducts/p6.png') },
  { label: 'Lip Balm', category: 'Lip Care', image: require('../assets/Shopbyproducts/p7.png') },
];

type Props = {
  onSelect: (category: string) => void;
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
            key={item.category}
            style={styles.card}
            onPress={() => onSelect(item.category)}
            activeOpacity={0.85}
          >
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            <View style={styles.labelWrap}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
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
    fontSize: 18,
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
    width: 108,
    height: 130,
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
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
