import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  emoji?: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionCard({ emoji, label, selected, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {selected && (
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: rw(14),
      paddingVertical: rh(16),
      paddingHorizontal: rw(18),
      marginBottom: rh(12),
    },
    cardSelected: {
      borderColor: colors.selectedBorder,
      borderWidth: 2,
      backgroundColor: colors.background,
    },
    emoji: {
      fontSize: rf(22),
      marginRight: rw(14),
    },
    label: {
      flex: 1,
      fontSize: rf(16),
      fontWeight: '500',
      color: colors.text,
    },
    labelSelected: {
      color: colors.text,
      fontWeight: '700',
    },
    check: {
      width: rw(22),
      height: rw(22),
      borderRadius: rw(11),
      backgroundColor: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkText: {
      color: colors.surface,
      fontSize: rf(13),
      fontWeight: '700',
    },
  });
