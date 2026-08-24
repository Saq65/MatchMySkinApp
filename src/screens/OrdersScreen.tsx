import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import type { ThemeColors } from '../theme/colors';
import { useThemedStyles } from '../theme/useThemedStyles';
import { StyleSheet } from 'react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

export function OrdersScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="My orders" onBack={() => navigation.goBack()} />
      <EmptyState
        icon="receipt-outline"
        title="No orders yet"
        subtitle="Products you buy will show up here."
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
