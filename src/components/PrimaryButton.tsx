import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, disabled }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.text,
      borderRadius: rw(14),
      paddingVertical: rh(16),
      alignItems: 'center',
    },
    buttonDisabled: {
      backgroundColor: colors.progressTrack,
    },
    label: {
      color: colors.surface,
      fontSize: rf(16),
      fontWeight: '700',
    },
  });
