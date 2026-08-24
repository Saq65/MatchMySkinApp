import notifee, {
  AndroidImportance,
  TimeUnit,
  TriggerType,
} from '@notifee/react-native';

export const CHANNEL_ENGAGEMENT = 'engagement';
export const CHANNEL_UPDATES = 'updates';
export const CHANNEL_PRICE_DROP = 'price_drop';

// Fixed id so re-scheduling (e.g. on every app launch) replaces the existing
// trigger instead of stacking duplicates.
const ENGAGEMENT_REMINDER_ID = 'engagement-2h';
const ENGAGEMENT_INTERVAL_HOURS = 2;

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

// Repeats every 2 hours until cancelEngagementReminder() is called (e.g. the
// user turns notifications off). Safe to call repeatedly -- same id replaces
// the previous trigger rather than stacking a new one.
export async function scheduleEngagementReminder(): Promise<void> {
  await setupNotificationChannels();
  await notifee.createTriggerNotification(
    {
      id: ENGAGEMENT_REMINDER_ID,
      title: 'roopsee',
      body: "Check out what's new since you last visited",
      android: { channelId: CHANNEL_ENGAGEMENT },
    },
    {
      type: TriggerType.INTERVAL,
      interval: ENGAGEMENT_INTERVAL_HOURS,
      timeUnit: TimeUnit.HOURS,
    },
  );
}

export async function cancelEngagementReminder(): Promise<void> {
  await notifee.cancelTriggerNotification(ENGAGEMENT_REMINDER_ID);
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
