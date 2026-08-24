import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { useTheme, type ThemePreference } from '../context/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import {
  getStoredNotificationsEnabled,
  getStoredPriceDropAlertsEnabled,
  setStoredNotificationsEnabled,
  setStoredPriceDropAlertsEnabled,
} from '../services/notificationPrefsStorage';
import {
  cancelEngagementReminder,
  hasLocalNotificationPermission,
  requestLocalNotificationPermission,
  scheduleEngagementReminder,
} from '../services/localNotifications';
import { setPriceDropAlertsTag } from '../services/pushNotifications';
import type { ThemeColors } from '../theme/colors';
import { rf, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const APPEARANCE_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function SettingsScreen({ navigation }: Props) {
  const { colors, preference, setPreference } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(false);
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [storedNotifications, storedPriceDropAlerts] = await Promise.all([
        getStoredNotificationsEnabled(),
        getStoredPriceDropAlertsEnabled(),
      ]);
      if (storedNotifications !== null) {
        setNotifications(storedNotifications);
      } else {
        // No saved preference yet (fresh install) -- reflect the OS's actual
        // permission state instead of assuming enabled.
        setNotifications(await hasLocalNotificationPermission());
      }
      if (storedPriceDropAlerts !== null) {
        setPriceDropAlerts(storedPriceDropAlerts);
        setPriceDropAlertsTag(storedPriceDropAlerts);
      }
    })();
  }, []);

  const onToggleNotifications = useCallback(async (value: boolean) => {
    if (!value) {
      setNotifications(false);
      await setStoredNotificationsEnabled(false);
      await cancelEngagementReminder();
      return;
    }

    setNotificationsLoading(true);
    const granted = await requestLocalNotificationPermission();
    setNotificationsLoading(false);

    if (!granted) {
      Alert.alert(
        'Notifications disabled',
        'Enable notifications for roopsee in your device settings to get price-drop alerts and updates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    setNotifications(true);
    await setStoredNotificationsEnabled(true);
    await scheduleEngagementReminder();
  }, []);

  const onTogglePriceDropAlerts = useCallback(async (value: boolean) => {
    setPriceDropAlerts(value);
    await setStoredPriceDropAlertsEnabled(value);
    setPriceDropAlertsTag(value);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.appearanceRow}>
          {APPEARANCE_OPTIONS.map(option => {
            const selected = preference === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.appearanceOption, selected && styles.appearanceOptionSelected]}
                onPress={() => setPreference(option.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.appearanceOptionLabel,
                    selected && styles.appearanceOptionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={rw(20)} color={colors.text} />
          <Text style={styles.rowLabel}>Push notifications</Text>
          <Switch
            value={notifications}
            onValueChange={onToggleNotifications}
            disabled={notificationsLoading}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
        <View style={styles.row}>
          <Ionicons name="pricetag-outline" size={rw(20)} color={colors.text} />
          <Text style={styles.rowLabel}>Price-drop alerts</Text>
          <Switch
            value={priceDropAlerts}
            onValueChange={onTogglePriceDropAlerts}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <Ionicons name="shield-checkmark-outline" size={rw(20)} color={colors.text} />
          <Text style={styles.rowLabel}>Privacy policy</Text>
          <Ionicons name="chevron-forward" size={rw(18)} color={colors.tabInactive} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} activeOpacity={0.7}>
          <Ionicons name="help-circle-outline" size={rw(20)} color={colors.text} />
          <Text style={styles.rowLabel}>Help & support</Text>
          <Ionicons name="chevron-forward" size={rw(18)} color={colors.tabInactive} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={rw(18)} color={colors.danger} />
        <Text style={styles.logoutLabel}>Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    section: {
      marginHorizontal: spacing.lg,
      marginBottom: spacing.lg,
    },
    sectionLabel: {
      fontSize: rf(12),
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.5,
      marginBottom: spacing.sm,
    },
    appearanceRow: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: radii.md,
      padding: rw(4),
      gap: rw(4),
    },
    appearanceOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radii.sm,
    },
    appearanceOptionSelected: {
      backgroundColor: colors.primary,
    },
    appearanceOptionLabel: {
      fontSize: rf(13),
      fontWeight: '600',
      color: colors.text,
    },
    appearanceOptionLabelSelected: {
      color: colors.surface,
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
      fontSize: rf(15),
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
      fontSize: rf(15),
      fontWeight: '700',
      color: colors.danger,
    },
  });
