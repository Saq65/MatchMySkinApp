import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_ENABLED_KEY = 'matchmyskin.notificationsEnabled';
const PRICE_DROP_ALERTS_ENABLED_KEY = 'matchmyskin.priceDropAlertsEnabled';

export async function getStoredNotificationsEnabled(): Promise<boolean | null> {
  const raw = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  if (raw === null) {
    return null;
  }
  return raw === 'true';
}

export async function setStoredNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, String(enabled));
}

export async function getStoredPriceDropAlertsEnabled(): Promise<boolean | null> {
  const raw = await AsyncStorage.getItem(PRICE_DROP_ALERTS_ENABLED_KEY);
  if (raw === null) {
    return null;
  }
  return raw === 'true';
}

export async function setStoredPriceDropAlertsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(PRICE_DROP_ALERTS_ENABLED_KEY, String(enabled));
}
