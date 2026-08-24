import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';


const CATEGORIES = [
  { label: 'Face', bodyArea: null, image: require('../assets/SearchByCategory/face.webp') },
  { label: 'Body', bodyArea: 'Body', image: require('../assets/SearchByCategory/body.webp') },
  { label: 'Eyes', bodyArea: 'Eyes', image: require('../assets/SearchByCategory/eyes.webp') },
  { label: 'Lips', bodyArea: 'Lips', image: require('../assets/SearchByCategory/lips.webp') },
];

const CARD_SIZE = rw(78);

type Props = {
  onSelect: (bodyArea: string | null) => void;
};

export function SearchByCategory({ onSelect }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  // null-vs-null is ambiguous (Face and "nothing selected" both use null),
  // so track selection by label instead of bodyArea value.
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const handleSelect = (label: string, bodyArea: string | null) => {
    setSelectedLabel(label);
    onSelect(bodyArea);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search by category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {CATEGORIES.map(item => {
          const isSelected = selectedLabel === item.label;
          return (
            <TouchableOpacity
              key={item.label}
              style={styles.item}
              onPress={() => handleSelect(item.label, item.bodyArea)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${item.label}`}
              accessibilityState={{ selected: isSelected }}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <View style={[styles.card, isSelected && styles.cardSelected]}>
                <Image source={item.image} style={styles.image} resizeMode="cover" />
              </View>
              <Text
                style={[styles.label, isSelected && styles.labelSelected]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      paddingHorizontal: 1,
    },
    item: {
      alignItems: 'center',
      width: CARD_SIZE,
    },
    card: {
      width: CARD_SIZE,
      height: CARD_SIZE,
      borderRadius: radii.sm,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: rw(1.5),
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    cardSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
      shadowOpacity: 0.15,
      elevation: 3,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: radii.sm,
    },
    label: {
      fontSize: rf(13),
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    labelSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
