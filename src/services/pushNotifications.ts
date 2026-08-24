import { OneSignal } from 'react-native-onesignal';
import { ONESIGNAL_APP_ID } from '../config/onesignal';

export type NotificationType = 'price_drop' | 'new_product' | 'wishlist' | 'welcome';

export type NotificationData = {
  type?: NotificationType | string;
  productUid?: string;
  [key: string]: string | undefined;
};

let initialized = false;

// Call once at app startup. No-ops until a real ONESIGNAL_APP_ID is set (see
// src/config/onesignal.ts), so the feature stays inert instead of crashing.
export function initPushNotifications(): void {
  if (initialized || ONESIGNAL_APP_ID.startsWith('REPLACE_WITH_')) {
    return;
  }
  OneSignal.initialize(ONESIGNAL_APP_ID);
  initialized = true;
}

// Any code that touches the OneSignal native module directly (rather than
// through the guarded helpers below) must check this first -- calling in
// before initialize() throws IllegalStateException natively.
export function isPushNotificationsInitialized(): boolean {
  return initialized;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!initialized) return false;
  try {
    return await OneSignal.Notifications.requestPermission(true);
  } catch {
    return false;
  }
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (!initialized) return false;
  try {
    return await OneSignal.Notifications.getPermissionAsync();
  } catch {
    return false;
  }
}

// Ties this device to the logged-in user so OneSignal can target them
// directly (external_id) instead of needing our own device-token endpoint.
export function identifyUser(userId: string): void {
  if (!initialized) return;
  try {
    OneSignal.login(userId);
  } catch {
    // no-op
  }
}

export function clearIdentifiedUser(): void {
  if (!initialized) return;
  try {
    OneSignal.logout();
  } catch {
    // no-op
  }
}

// Lets the backend/dashboard filter by tag (e.g. send price-drop alerts only
// to users with price_drop_alerts=true) without a custom preferences endpoint.
export function setPriceDropAlertsTag(enabled: boolean): void {
  if (!initialized) return;
  try {
    OneSignal.User.addTag('price_drop_alerts', enabled ? 'true' : 'false');
  } catch {
    // no-op
  }
}
