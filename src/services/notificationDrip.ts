import notifee, { type TimestampTrigger, TriggerType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../navigation/navigationRef';
import { CHANNEL_ENGAGEMENT, setupNotificationChannels } from './localNotifications';

export type DripTarget = 'home' | 'quiz' | 'products';

type DripMessage = {
  id: string;
  delayMinutes: number;
  title: string;
  body: string;
  target: DripTarget;
};

// Same onboarding drip as the website (src/lib/push/messages.js on the
// skin-match-tool repo), delivered as local notifications instead of web
// push. delayMinutes is measured from when the user enabled notifications
// (the anchor below), same "day zero per subscriber" idea as the web version.
const DRIP_MESSAGES: DripMessage[] = [
  {
    id: 'welcome',
    delayMinutes: 5,
    title: 'Welcome to Roopsee 👋',
    body: 'Discover skincare products matched to your skin and your needs.',
    target: 'home',
  },
  {
    id: 'know-your-skin',
    delayMinutes: 60,
    title: 'Know Your Skin 🧴',
    body: 'Not sure about your skin type? Take our quick skin quiz and find out.',
    target: 'quiz',
  },
  {
    id: 'perfect-match',
    delayMinutes: 360,
    title: 'Find Your Perfect Match ✨',
    body: 'Let Roopsee help you discover skincare products that suit your skin.',
    target: 'quiz',
  },
  {
    id: 'compare-before-buy',
    delayMinutes: 1440,
    title: 'Compare Before You Buy 💰',
    body: 'Find the best prices for your favorite skincare products across marketplaces.',
    target: 'products',
  },
  {
    id: 'deserves-better',
    delayMinutes: 2880,
    title: 'Your Skin Deserves Better 💖',
    body: 'Explore products recommended for your skin concerns and goals.',
    target: 'products',
  },
  {
    id: 'ingredients',
    delayMinutes: 4320,
    title: 'Curious About Ingredients? 🔍',
    body: "Understand what's inside your skincare products before you buy.",
    target: 'products',
  },
  {
    id: 'journey-starts',
    delayMinutes: 7200,
    title: 'Your Skincare Journey Starts Here 🌸',
    body: 'Take the Roopsee skin quiz and get personalized recommendations.',
    target: 'quiz',
  },
  {
    id: 'better-price',
    delayMinutes: 10080,
    title: "Don't Miss a Better Price 👀",
    body: 'Roopsee helps you compare prices so you can shop smarter.',
    target: 'products',
  },
  {
    id: 'skincare-advice',
    delayMinutes: 14400,
    title: 'Need Skincare Advice? 💬',
    body: 'Ask Roopsee about your skin, ingredients, products, and more.',
    target: 'home',
  },
  {
    id: 'discover-compare-choose',
    delayMinutes: 20160,
    title: 'Discover. Compare. Choose. 🛍️',
    body: 'Your smarter way to find the right skincare products is here — Roopsee.',
    target: 'products',
  },
];

const DRIP_ANCHOR_KEY = 'matchmyskin.notificationDripAnchor';
const DRIP_NOTIFICATION_ID_PREFIX = 'drip-';

async function getOrCreateAnchor(): Promise<number> {
  const stored = await AsyncStorage.getItem(DRIP_ANCHOR_KEY);
  if (stored) return Number(stored);
  const now = Date.now();
  await AsyncStorage.setItem(DRIP_ANCHOR_KEY, String(now));
  return now;
}

// Schedules the full sequence from the stored anchor (or starts a new one on
// first call). Safe to call repeatedly -- each message has a fixed id, so
// re-scheduling (e.g. on every app launch) replaces rather than duplicates,
// and anything already due by now is skipped instead of firing immediately.
export async function scheduleOnboardingDrip(): Promise<void> {
  await setupNotificationChannels();
  const anchor = await getOrCreateAnchor();

  await Promise.all(
    DRIP_MESSAGES.map(async message => {
      const timestamp = anchor + message.delayMinutes * 60_000;
      if (timestamp <= Date.now()) return;

      const trigger: TimestampTrigger = { type: TriggerType.TIMESTAMP, timestamp };

      await notifee.createTriggerNotification(
        {
          id: `${DRIP_NOTIFICATION_ID_PREFIX}${message.id}`,
          title: message.title,
          body: message.body,
          data: { target: message.target },
          android: { channelId: CHANNEL_ENGAGEMENT },
        },
        trigger,
      );
    }),
  );
}

export async function cancelOnboardingDrip(): Promise<void> {
  await Promise.all(
    DRIP_MESSAGES.map(message =>
      notifee.cancelTriggerNotification(`${DRIP_NOTIFICATION_ID_PREFIX}${message.id}`),
    ),
  );
  await AsyncStorage.removeItem(DRIP_ANCHOR_KEY);
}

export function resolveDripTarget(value: unknown): DripTarget | null {
  return value === 'home' || value === 'quiz' || value === 'products' ? value : null;
}

// Shared by LocalNotificationHandler (foreground taps, cold-start taps via
// getInitialNotification) and index.js's onBackgroundEvent (taps while the
// app is merely backgrounded, not quit -- the JS context and this same
// navigationRef are still alive in that case, so navigating directly here
// works instead of needing a "pending target" hand-off).
export function navigateToDripTarget(target: DripTarget) {
  if (!navigationRef.isReady()) return;

  switch (target) {
    case 'quiz':
      navigationRef.navigate('Quiz');
      break;
    case 'products':
      navigationRef.navigate('Main', { screen: 'Products' });
      break;
    default:
      navigationRef.navigate('Main', { screen: 'Home' });
  }
}
