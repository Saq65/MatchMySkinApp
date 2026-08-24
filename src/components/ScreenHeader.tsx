import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import type { IoniconName } from '../theme/icons';
import { rf, rw } from '../theme/responsive';
import { spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = {
  title: string;
  onBack?: () => void;
  rightIcon?: IoniconName;
  onRightPress?: () => void;
};

export function ScreenHeader({ title, onBack, rightIcon, onRightPress }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={rw(24)} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={[styles.side, styles.rightSide]}>
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name={rightIcon} size={rw(22)} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    side: {
      width: rw(32),
    },
    rightSide: {
      alignItems: 'flex-end',
    },
    title: {
      flex: 1,
      fontSize: rf(18),
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
  });
