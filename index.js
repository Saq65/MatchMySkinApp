/**
 * @format
 */

import 'react-native-gesture-handler';
import notifee, { EventType } from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { navigateToDripTarget, resolveDripTarget } from './src/services/notificationDrip';

// Handles a notification tap while the app is backgrounded (not fully quit --
// that case is covered by LocalNotificationHandler's getInitialNotification
// call instead). Must be registered here, outside the component tree, per
// notifee's requirements. The app's JS context (and navigationRef) is still
// alive when merely backgrounded, so navigating directly here is safe.
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type !== EventType.PRESS) return;
  const target = resolveDripTarget(detail.notification?.data?.target);
  if (target) navigateToDripTarget(target);
});

AppRegistry.registerComponent(appName, () => App);
