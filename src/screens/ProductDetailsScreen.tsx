import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  type LayoutChangeEvent,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  type ScrollViewInstance,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { fetchProductOffers, type ProductOffer } from '../services/offersApi';
import { fetchRecommendedProducts } from '../services/quizApi';
import { getStoredQuizProfile } from '../services/quizProfileStorage';
import type { RootStackParamList } from '../navigation/types';
import { productFromRoutine, type Product } from '../types/product';
import type { ThemeColors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

function titleCase(value: string): string {
  return value.replace(/\b\w/g, char => char.toUpperCase());
}

const ROOPSEE_SITE_URL = 'https://roopsee.com';

const MAX_GALLERY_IMAGES = 4;
const GALLERY_AUTOPLAY_INTERVAL_MS = 3500;

const RETAILER_LOGOS: Partial<Record<string, ImageSourcePropType>> = {
  amazon: require('../assets/icons/amazon.png'),
  nykaa: require('../assets/icons/nyka.webp'),
  tira: require('../assets/icons/tiira.png'),
};

function RetailerLabel({ site }: { site: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const logo = RETAILER_LOGOS[site.toLowerCase()];
  if (logo) {
    return <Image source={logo} style={styles.retailerLogo} resizeMode="cover" />;
  }
  return <Text style={styles.offerSite}>{titleCase(site)}</Text>;
}

function RoopseeLabel() {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  return (
    <Text style={styles.roopseeWordmark}>
      roopsee<Text style={styles.roopseeWordmarkDot}>.</Text>
    </Text>
  );
}

export function ProductDetailsScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const { product } = route.params;
  const { isWishlisted, toggleWishlist } = useShop();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [offers, setOffers] = useState<ProductOffer[] | null>(null);
  const [offersError, setOffersError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [similar, setSimilar] = useState<Product[] | null>(null);
  const [galleryWidth, setGalleryWidth] = useState(0);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState(0);
  const galleryScrollRef = useRef<ScrollViewInstance>(null);

  const wishlisted = isWishlisted(product.id);

  const images = useMemo(() => {
    const seen = new Set<string>();
    const gallery: string[] = [];
    const add = (url: string | undefined) => {
      if (url && !seen.has(url)) {
        seen.add(url);
        gallery.push(url);
      }
    };
    add(product.imageUrl);
    offers?.forEach(offer => {
      add(offer.image_url);
      offer.image_urls?.forEach(add);
    });
    return gallery.slice(0, MAX_GALLERY_IMAGES);
  }, [product.imageUrl, offers]);

  const markImageFailed = useCallback((url: string) => {
    setFailedImages(prev => (prev.has(url) ? prev : new Set(prev).add(url)));
  }, []);

  const onGalleryLayout = useCallback((event: LayoutChangeEvent) => {
    setGalleryWidth(event.nativeEvent.layout.width);
  }, []);

  const onGalleryScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!galleryWidth) return;
      const page = Math.round(event.nativeEvent.contentOffset.x / galleryWidth);
      setGalleryActiveIndex(page);
    },
    [galleryWidth],
  );

  useEffect(() => {
    if (images.length <= 1 || !galleryWidth) return;
    const timer = setTimeout(() => {
      const nextIndex = (galleryActiveIndex + 1) % images.length;
      galleryScrollRef.current?.scrollTo({ x: nextIndex * galleryWidth, animated: true });
      setGalleryActiveIndex(nextIndex);
    }, GALLERY_AUTOPLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [galleryActiveIndex, galleryWidth, images.length]);

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

  useEffect(() => {
    let cancelled = false;
    getStoredQuizProfile()
      .then(profile => {
        if (!profile) return null;
        return fetchRecommendedProducts(profile, 409);
      })
      .then(items => {
        if (cancelled || !items) return;
        const matches = items
          .map(productFromRoutine)
          .filter(item => item.id !== product.id && item.category === product.category)
          .slice(0, 10);
        setSimilar(matches);
      })
      .catch(() => {
        if (!cancelled) setSimilar([]);
      });
    return () => {
      cancelled = true;
    };
  }, [product.id, product.category]);

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
        <View style={styles.imageArea} onLayout={onGalleryLayout}>
          {images.length > 0 ? (
            <ScrollView
              ref={galleryScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onGalleryScroll}
              scrollEventThrottle={16}
            >
              {images.map(url => (
                <View key={url} style={[styles.gallerySlide, { width: galleryWidth || undefined }]}>
                  {!failedImages.has(url) ? (
                    <Image
                      source={{ uri: url }}
                      style={styles.image}
                      resizeMode="contain"
                      onError={() => markImageFailed(url)}
                    />
                  ) : (
                    <Ionicons name="flask-outline" size={rw(64)} color={colors.textMuted} />
                  )}
                </View>
              ))}
            </ScrollView>
          ) : (
            <Ionicons name="flask-outline" size={rw(64)} color={colors.textMuted} />
          )}
        </View>

        {images.length > 1 && (
          <View style={styles.galleryDots}>
            {images.map((url, index) => (
              <View
                key={url}
                style={[styles.galleryDot, index === galleryActiveIndex && styles.galleryDotActive]}
              />
            ))}
          </View>
        )}

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
                  <RetailerLabel site={offer.site} />
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
              {product.site ? (
                <RetailerLabel site={product.site} />
              ) : (
                <Text style={styles.offerSite}>Retailer</Text>
              )}
            </View>
            <Text style={styles.offerPrice}>₹{product.price.toFixed(0)}</Text>
            <View style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Buy now</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={styles.helperText}>No purchase link available for this product.</Text>
        )}

        {product.productUid && (
          <TouchableOpacity
            style={styles.offerRow}
            onPress={() => Linking.openURL(`${ROOPSEE_SITE_URL}/products/${product.productUid}`)}
            activeOpacity={0.85}
          >
            <View style={styles.offerInfo}>
              <RoopseeLabel />
            </View>
            {offers && offers.length > 0 && (
              <Text style={styles.offerPrice}>₹{offers[0].price.toFixed(0)}</Text>
            )}
            <View style={styles.buyButton}>
              <Text style={styles.buyButtonText}>View</Text>
            </View>
          </TouchableOpacity>
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

        {similar && similar.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Similar products</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarRow}
            >
              {similar.map(item => (
                <View key={item.id} style={styles.similarItem}>
                  <ProductCard
                    product={item}
                    wishlisted={isWishlisted(item.id)}
                    onPress={() => navigation.push('ProductDetails', { product: item })}
                    onToggleWishlist={() => toggleWishlist(item)}
                  />
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
  gallerySlide: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: rw(6),
    marginBottom: spacing.md,
  },
  galleryDot: {
    width: rw(6),
    height: rw(6),
    borderRadius: rw(3),
    backgroundColor: colors.border,
  },
  galleryDotActive: {
    backgroundColor: colors.primary,
    width: rw(16),
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
  retailerLogo: {
    width: rw(60),
    height: rw(25),
    alignSelf: 'flex-start',
  },
  roopseeWordmark: {
    fontSize: rf(17),
    fontWeight: '800',
    color: colors.text,
  },
  roopseeWordmarkDot: {
    color: colors.primary,
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
  similarRow: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  similarItem: {
    width: rw(150),
  },
});
