/**
 * MatchMySkin
 *
 * @format
 */

import { OTPWidget } from '@msg91comm/sendotp-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ShopProvider } from './src/context/ShopContext';
import { MSG91_TOKEN_AUTH, MSG91_WIDGET_ID } from './src/config/msg91';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  useEffect(() => {
    OTPWidget.initializeWidget(MSG91_WIDGET_ID, MSG91_TOKEN_AUTH);
  }, []);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AuthProvider>
          <ShopProvider>
            <StatusBar barStyle="dark-content" />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </ShopProvider>
        </AuthProvider>
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
