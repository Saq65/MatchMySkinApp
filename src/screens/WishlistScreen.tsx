import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Wishlist'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function WishlistScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const numColumns = width >= 700 ? 4 : width >= 500 ? 3 : 2;
  const { wishlist, isWishlisted, toggleWishlist } = useShop();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Wishlist</Text>

      {wishlist.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Your wishlist is empty"
          subtitle="Tap the heart on any product to save it here."
        />
      ) : (
        <FlatList
          key={numColumns}
          data={wishlist}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              wishlisted={isWishlisted(item.id)}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
              onToggleWishlist={() => toggleWishlist(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
});
