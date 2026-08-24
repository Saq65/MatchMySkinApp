import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rh, rw } from '../theme/responsive';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const progress = total > 0 ? current / total : 0;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    track: {
      height: rh(6),
      borderRadius: rw(3),
      backgroundColor: colors.progressTrack,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: rw(3),
      backgroundColor: colors.primary,
    },
  });
