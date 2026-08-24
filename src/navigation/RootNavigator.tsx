import { createNativeStackNavigator } from '@react-navigation/native-stack';
// Login/Signup are reachable (e.g. the header's Login button) but still
// don't gate entry to Main — logging in unlocks personalization (saved
// wishlist server-side, etc.) rather than being required to browse the app.
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="QuizResults" component={ResultsScreen} />
    </Stack.Navigator>
  );
}
