import { useEffect } from 'react';
import { OneSignal, type NotificationClickEvent } from 'react-native-onesignal';
import { useShop } from '../context/ShopContext';
import { navigationRef } from '../navigation/navigationRef';
import { isPushNotificationsInitialized, type NotificationData } from '../services/pushNotifications';
import type { Product } from '../types/product';

function goTo(data: NotificationData | undefined, findWishlisted: (uid: string) => Product | undefined) {
  if (!navigationRef.isReady()) return;

  switch (data?.type) {
    case 'price_drop':
    case 'wishlist': {
      const product = data.productUid ? findWishlisted(data.productUid) : undefined;
      if (product) {
        navigationRef.navigate('ProductDetails', { product });
      } else {
        navigationRef.navigate('Main', { screen: 'Wishlist' });
      }
      break;
    }
    case 'new_product':
      navigationRef.navigate('Main', { screen: 'Products' });
      break;
    default:
      navigationRef.navigate('Main', { screen: 'Home' });
  }
}

export function PushNotificationHandler() {
  const { wishlist } = useShop();

  useEffect(() => {
    if (!isPushNotificationsInitialized()) return;

    const findWishlisted = (uid: string) =>
      wishlist.find(item => item.id === uid || item.productUid === uid);

    const onClick = (event: NotificationClickEvent) => {
      goTo(event.notification.additionalData as NotificationData | undefined, findWishlisted);
    };

    OneSignal.Notifications.addEventListener('click', onClick);
    return () => {
      OneSignal.Notifications.removeEventListener('click', onClick);
    };
  }, [wishlist]);

  return null;
}
