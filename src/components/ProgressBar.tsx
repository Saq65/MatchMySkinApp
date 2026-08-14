import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: Props) {
  const progress = total > 0 ? current / total : 0;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
