import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { rf, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';

// Matched to the real "category" tag in the scored catalog (/recommend),
// which only has Face/Body today — Eyes/Lips have no matching products yet,
// so they'll honestly show "no matches" until that data exists rather than
// faking a filter. "Face" covers the bulk of the catalog with no distinct
// body-area filter needed, so it just clears the filter (browse all).
const CATEGORIES = [
  { label: 'Face', bodyArea: null, image: require('../assets/SearchByCategory/face.webp') },
  { label: 'Body', bodyArea: 'Body', image: require('../assets/SearchByCategory/body.webp') },
  { label: 'Eyes', bodyArea: 'Eyes', image: require('../assets/SearchByCategory/eyes.webp') },
  { label: 'Lips', bodyArea: 'Lips', image: require('../assets/SearchByCategory/lips.webp') },
];

type Props = {
  onSelect: (bodyArea: string | null) => void;
};

export function SearchByCategory({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search by category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {CATEGORIES.map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            onPress={() => onSelect(item.bodyArea)}
            activeOpacity={0.85}
          >
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} resizeMode="cover" />
            </View>
            <Text style={styles.label}>{item.label}</Text>
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
    gap: spacing.lg,
  },
  item: {
    alignItems: 'center',
    width: rw(100),
  },
  card: {
    width: rw(120),
    height: rw(120),
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: rw(6),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
  },
});
