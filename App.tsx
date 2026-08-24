/**
 * roopsee
 *
 * @format
 */

import { OTPWidget } from '@msg91comm/sendotp-react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { PushNotificationHandler } from './src/components/PushNotificationHandler';
import { AuthProvider } from './src/context/AuthContext';
import { ShopProvider } from './src/context/ShopContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from './src/config/google';
import { MSG91_TOKEN_AUTH, MSG91_WIDGET_ID } from './src/config/msg91';
import { navigationRef } from './src/navigation/navigationRef';
import { RootNavigator } from './src/navigation/RootNavigator';
import {
  hasLocalNotificationPermission,
  scheduleEngagementReminder,
  setupNotificationChannels,
} from './src/services/localNotifications';
import { getStoredNotificationsEnabled } from './src/services/notificationPrefsStorage';
import { initPushNotifications } from './src/services/pushNotifications';

// Runs at module load, before any component mounts -- PushNotificationHandler's
// effect (a descendant) fires before App's, so initializing inside a useEffect
// here would race it and silently miss the notification-click listener.
initPushNotifications();

function AppContent() {
  const { colors, scheme } = useTheme();

  const navTheme = {
    ...(scheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
      <PushNotificationHandler />
    </>
  );
}

function App() {
  useEffect(() => {
    OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });

    setupNotificationChannels();
    // Re-arm the repeating reminder on every launch -- covers the case where
    // the OS killed it (e.g. after a device reboot) since the last session.
    getStoredNotificationsEnabled().then(async enabled => {
      if (enabled && (await hasLocalNotificationPermission())) {
        scheduleEngagementReminder();
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <AuthProvider>
            <ShopProvider>
              <AppContent />
            </ShopProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

export default App;
