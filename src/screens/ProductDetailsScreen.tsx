import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { useShop } from '../context/ShopContext';
import { fetchProductOffers, type ProductOffer } from '../services/offersApi';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

function titleCase(value: string): string {
  return value.replace(/\b\w/g, char => char.toUpperCase());
}

export function ProductDetailsScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const { isWishlisted, toggleWishlist } = useShop();
  const [imageFailed, setImageFailed] = useState(false);
  const [offers, setOffers] = useState<ProductOffer[] | null>(null);
  const [offersError, setOffersError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const showImage = product.imageUrl && !imageFailed;

  useEffect(() => {
    if (!product.productUid) {
      return;
    }
    let cancelled = false;
    fetchProductOffers(product.productUid)
      .then(response => {
        if (!cancelled) {
          setOffers(response.offers);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOffersError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [product.productUid]);

  const onRefresh = useCallback(async () => {
    if (!product.productUid) return;
    setRefreshing(true);
    try {
      const response = await fetchProductOffers(product.productUid);
      setOffers(response.offers);
      setOffersError(false);
    } catch {
      setOffersError(true);
    } finally {
      setRefreshing(false);
    }
  }, [product.productUid]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Product details"
        onBack={() => navigation.goBack()}
        rightIcon={wishlisted ? 'heart' : 'heart-outline'}
        onRightPress={() => toggleWishlist(product)}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.imageArea}>
          {showImage ? (
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              resizeMode="contain"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Ionicons name="flask-outline" size={rw(64)} color={colors.textMuted} />
          )}
        </View>

        {product.matchScore !== undefined && (
          <View style={styles.matchBadge}>
            <Ionicons name="sparkles-outline" size={rw(14)} color={colors.primaryDark} />
            <Text style={styles.matchBadgeText}>
              {product.matchScore}% match{product.matchLabel ? ` · ${product.matchLabel}` : ''}
            </Text>
          </View>
        )}

        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.metaRow}>
          {product.rating !== undefined && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={rw(16)} color={colors.star} />
              <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
            </View>
          )}
          <Text style={styles.category}>{product.category}</Text>
        </View>

        <Text style={styles.sectionHeading}>Where to buy</Text>

        {product.productUid ? (
          offersError ? (
            <Text style={styles.helperText}>Couldn't load retailer prices.</Text>
          ) : !offers ? (
            <ActivityIndicator color={colors.text} style={styles.offersLoading} />
          ) : offers.length === 0 ? (
            <Text style={styles.helperText}>No retailer prices found for this product yet.</Text>
          ) : (
            offers.map((offer, index) => (
              <TouchableOpacity
                key={`${offer.site}-${offer.id}`}
                style={[styles.offerRow, index === 0 && styles.offerRowCheapest]}
                onPress={() => Linking.openURL(offer.product_url)}
                activeOpacity={0.85}
              >
                <View style={styles.offerInfo}>
                  <Text style={styles.offerSite}>{titleCase(offer.site)}</Text>
                  {index === 0 && <Text style={styles.cheapestTag}>Best price</Text>}
                </View>
                <Text style={styles.offerPrice}>₹{offer.price.toFixed(0)}</Text>
                <View style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Buy now</Text>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : product.productUrl ? (
          <TouchableOpacity
            style={styles.offerRow}
            onPress={() => Linking.openURL(product.productUrl!)}
            activeOpacity={0.85}
          >
            <View style={styles.offerInfo}>
              <Text style={styles.offerSite}>{product.site ? titleCase(product.site) : 'Retailer'}</Text>
            </View>
            <Text style={styles.offerPrice}>₹{product.price.toFixed(0)}</Text>
            <View style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Buy now</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={styles.helperText}>No purchase link available for this product.</Text>
        )}

        {product.heroIngredient && (
          <>
            <Text style={styles.sectionHeading}>Hero ingredient</Text>
            <Text style={styles.description}>{product.heroIngredient}</Text>
          </>
        )}

        {product.whenToUse && (
          <>
            <Text style={styles.sectionHeading}>When to use</Text>
            <Text style={styles.description}>{product.whenToUse}</Text>
          </>
        )}

        {product.usageInstructions && (
          <>
            <Text style={styles.sectionHeading}>How to use</Text>
            <Text style={styles.description}>{product.usageInstructions}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  imageArea: {
    height: rw(220),
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: rh(6),
    marginBottom: spacing.sm,
    gap: rw(6),
  },
  matchBadgeText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: colors.primaryDark,
  },
  brand: {
    fontSize: rf(13),
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  name: {
    fontSize: rf(21),
    fontWeight: '700',
    color: colors.text,
    marginTop: rh(4),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rw(4),
  },
  rating: {
    fontSize: rf(14),
    fontWeight: '600',
    color: colors.text,
  },
  category: {
    fontSize: rf(14),
    color: colors.textMuted,
  },
  sectionHeading: {
    fontSize: rf(15),
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  helperText: {
    fontSize: rf(14),
    color: colors.textMuted,
  },
  offersLoading: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  offerRowCheapest: {
    borderColor: colors.text,
    borderWidth: 2,
  },
  offerInfo: {
    flex: 1,
    minWidth: 0,
  },
  offerSite: {
    fontSize: rf(15),
    fontWeight: '700',
    color: colors.text,
  },
  cheapestTag: {
    fontSize: rf(11),
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: rh(2),
  },
  offerPrice: {
    fontSize: rf(15),
    fontWeight: '700',
    color: colors.text,
  },
  buyButton: {
    borderWidth: 1.5,
    borderColor: colors.text,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: rh(6),
  },
  buyButtonText: {
    fontSize: rf(12),
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: rf(14),
    color: colors.textMuted,
    lineHeight: rf(21),
  },
});
