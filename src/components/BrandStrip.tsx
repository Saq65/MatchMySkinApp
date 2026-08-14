import { ScrollView, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = {
  brands: string[];
};

export function BrandStrip({ brands }: Props) {
  if (brands.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {brands.map(brand => (
        <Text key={brand} style={styles.brand} numberOfLines={1}>
          {brand}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lavender,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    alignItems: 'center',
    gap: spacing.xl,
  },
  brand: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
