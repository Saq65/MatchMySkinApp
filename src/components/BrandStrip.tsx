import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf, rh } from '../theme/responsive';
import { spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  brands: string[];
};

export function BrandStrip({ brands }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.lavender,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingVertical: rh(14),
      alignItems: 'center',
      gap: spacing.xl,
    },
    brand: {
      fontSize: rf(15),
      fontWeight: '700',
      color: colors.text,
    },
  });
