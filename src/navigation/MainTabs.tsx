import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import type { ThemeColors } from '../theme/colors';
import type { IoniconName } from '../theme/icons';
import { rf } from '../theme/responsive';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Products: { active: 'grid', inactive: 'grid-outline' },
  Wishlist: { active: 'heart', inactive: 'heart-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

function TabIcon({
  routeName,
  focused,
  color,
  size,
}: {
  routeName: keyof MainTabParamList;
  focused: boolean;
  color: string;
  size: number;
}) {
  const icons = TAB_ICONS[routeName];
  return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
}

export function MainTabs() {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const { wishlist } = useShop();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: rf(11),
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon routeName={route.name} focused={focused} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarBadge: wishlist.length > 0 ? wishlist.length : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    badge: {
      backgroundColor: colors.primary,
      fontSize: rf(11),
      fontWeight: '700',
    },
  });
