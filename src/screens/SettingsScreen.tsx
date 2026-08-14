import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      <View style={styles.section}>
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          <Text style={styles.rowLabel}>Push notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={styles.row}>
          <Ionicons name="pricetag-outline" size={20} color={colors.text} />
          <Text style={styles.rowLabel}>Price-drop alerts</Text>
          <Switch
            value={priceDropAlerts}
            onValueChange={setPriceDropAlerts}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.text} />
          <Text style={styles.rowLabel}>Privacy policy</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.tabInactive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <Ionicons name="help-circle-outline" size={20} color={colors.text} />
          <Text style={styles.rowLabel}>Help & support</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.tabInactive} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutLabel}>Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },
});
