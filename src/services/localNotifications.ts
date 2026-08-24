import notifee, { AndroidImportance } from '@notifee/react-native';

export const CHANNEL_ENGAGEMENT = 'engagement';
export const CHANNEL_UPDATES = 'updates';
export const CHANNEL_PRICE_DROP = 'price_drop';

let channelsReady = false;

export async function setupNotificationChannels(): Promise<void> {
  if (channelsReady) return;
  channelsReady = true;

  await Promise.all([
    notifee.createChannel({
      id: CHANNEL_ENGAGEMENT,
      name: 'App reminders',
      importance: AndroidImportance.DEFAULT,
    }),
    notifee.createChannel({
      id: CHANNEL_UPDATES,
      name: 'New product updates',
      importance: AndroidImportance.DEFAULT,
    }),
    notifee.createChannel({
      id: CHANNEL_PRICE_DROP,
      name: 'Price drop alerts',
      importance: AndroidImportance.HIGH,
    }),
  ]);
}

export async function hasLocalNotificationPermission(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return settings.authorizationStatus >= 1;
}

export async function requestLocalNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

export async function notifyNewUpdate(title: string, body: string): Promise<void> {
  await setupNotificationChannels();
  await notifee.displayNotification({
    title,
    body,
    android: { channelId: CHANNEL_UPDATES },
  });
}

export async function notifyPriceDrop(productName: string, newPrice: number): Promise<void> {
  await setupNotificationChannels();
  await notifee.displayNotification({
    title: 'Price drop',
    body: `${productName} just dropped to ₹${newPrice.toFixed(0)}`,
    android: { channelId: CHANNEL_PRICE_DROP },
  });
}
