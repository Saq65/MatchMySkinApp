import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    chip: {
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.surface,
    },
    chipSelected: {
      borderColor: colors.text,
      backgroundColor: colors.sage,
    },
    label: {
      fontSize: rf(14),
      fontWeight: '600',
      color: colors.text,
    },
    labelSelected: {
      color: colors.text,
    },
  });
