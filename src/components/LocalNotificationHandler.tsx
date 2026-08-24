import notifee, { EventType } from '@notifee/react-native';
import { useEffect } from 'react';
import { navigateToDripTarget, resolveDripTarget } from '../services/notificationDrip';

export function LocalNotificationHandler() {
  useEffect(() => {
    // App launched by tapping a notification while fully quit.
    notifee.getInitialNotification().then(initial => {
      const target = resolveDripTarget(initial?.notification.data?.target);
      if (target) navigateToDripTarget(target);
    });

    // App was foregrounded or already running when the notification was tapped.
    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type !== EventType.PRESS) return;
      const target = resolveDripTarget(detail.notification?.data?.target);
      if (target) navigateToDripTarget(target);
    });
  }, []);

  return null;
}
