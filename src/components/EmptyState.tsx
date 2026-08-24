import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import type { IoniconName } from '../theme/icons';
import { rf, rw } from '../theme/responsive';
import { spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  icon: IoniconName;
  title: string;
  subtitle?: string;
};

export function EmptyState({ icon, title, subtitle }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={rw(48)} color={colors.tabInactive} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    title: {
      fontSize: rf(16),
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: rf(14),
      color: colors.textMuted,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
  });
