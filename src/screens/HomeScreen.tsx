import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { SearchByCategory } from '../components/SearchByCategory';
import { SearchByKBeauty } from '../components/SearchByKBeauty';
import { SearchByProduct } from '../components/SearchByProduct';
import AnnouncementBar from '../components/TickerBar';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { fetchRecommendedProducts, type QuizProfile } from '../services/quizApi';
import { getStoredQuizProfile } from '../services/quizProfileStorage';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { productFromRoutine, type Product } from '../types/product';
import { colors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { serifItalic } from '../theme/typography';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

function pickMatchSpread(products: Product[]): Product[] {
  const used = new Set<string>();
  const take = (pool: Product[], count: number) => {
    const picked = pool.filter(p => !used.has(p.id)).slice(0, count);
    picked.forEach(p => used.add(p.id));
    return picked;
  };

  const high = take(
    products.filter(p => (p.matchScore ?? 0) >= 90),
    2,
  );
  const mid = take(
    products.filter(p => (p.matchScore ?? 0) >= 75 && (p.matchScore ?? 0) < 90),
    2,
  );
  const low = take(
    products.filter(p => (p.matchScore ?? 0) < 60),
    2,
  );

  const spread = [...high, ...mid, ...low];
  if (spread.length < 6) {
    spread.push(...take(products, 6 - spread.length));
  }

  return spread.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}

export function HomeScreen({ navigation }: Props) {
  const { isLoggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useShop();
  const [profile, setProfile] = useState<QuizProfile | null | undefined>(undefined);
  const [matches, setMatches] = useState<Product[] | null>(null);
  const [matchesError, setMatchesError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // tab immediately reflects the new state, without needing a remount.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getStoredQuizProfile()
        .then(stored => {
          if (!cancelled) {
            setProfile(stored);
          }
        })
        .catch(err => {
          console.warn('[quizProfileStorage] read failed:', err);
          if (!cancelled) {
            setProfile(null);
          }
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useEffect(() => {
    if (!profile) {
      setMatches(null);
      return;
    }
    let cancelled = false;
    setMatches(null);
    setMatchesError(false);
    fetchRecommendedProducts(profile, 409)
      .then(products => {
        if (!cancelled) {
          setMatches(pickMatchSpread(products.map(productFromRoutine)));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMatchesError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const stored = await getStoredQuizProfile();
      setProfile(stored);
      if (stored) {
        const products = await fetchRecommendedProducts(stored, 409);
        setMatches(pickMatchSpread(products.map(productFromRoutine)));
        setMatchesError(false);
      } else {
        setMatches(null);
      }
    } catch {
      setMatchesError(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.wordmarkRow}>
        <Text style={styles.wordmark}>
          roopsee<Text style={styles.wordmarkDot}>.</Text>
        </Text>
        {!isLoggedIn && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
      <AnnouncementBar />

     
      {/* <BrandStrip brands={brands} /> */}

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
         <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Skin <Text style={styles.heroTitleItalic}>match</Text> tool
        </Text>
        <Text style={styles.heroSubtitle}>
          Skincare Products scored for your skin across 500+ brands
        </Text>
      </View>

        <Image
          source={require('../assets/mms-app.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />


        {/* <Text style={styles.greeting}>Hi{userName ? `, ${userName}` : ''} 👋</Text> */}

        {profile === undefined ? (
          <ActivityIndicator color={colors.text} style={styles.loading} />
        ) : profile === null ? (
          <View style={styles.quizPrompt}>
            <Text style={styles.quizPromptSubtitle}>
              Take our 2-minute skin quiz to get products scored specifically for your
              skin type and concerns — nothing shows here until you do.
            </Text>
            <TouchableOpacity
              style={styles.quizButton}
              onPress={() => navigation.navigate('Quiz')}
              activeOpacity={0.85}
            >
              <Text style={styles.quizButtonText}>Take the skin quiz</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.heading}>Your skin matches</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Quiz')}>
                <Text style={styles.sectionLink}>Retake quiz</Text>
              </TouchableOpacity>
            </View>

            {matchesError ? (
              <Text style={styles.errorText}>Couldn't load your matches. Check your connection.</Text>
            ) : !matches ? (
              <ActivityIndicator color={colors.text} style={styles.loading} />
            ) : (
              <View style={styles.grid}>
                {matches.map(product => (
                  <View key={product.id} style={styles.gridItem}>
                    <ProductCard
                      product={product}
                      wishlisted={isWishlisted(product.id)}
                      onPress={() => navigation.navigate('ProductDetails', { product })}
                      onToggleWishlist={() => toggleWishlist(product)}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        <SearchByCategory
          onSelect={bodyArea => navigation.navigate('Products', { bodyArea })}
        />
        <SearchByProduct
          onSelect={productType => navigation.navigate('Products', { productType })}
        />
        <SearchByKBeauty
          onSelect={brand => navigation.navigate('Products', { brand })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  wordmark: {
    fontSize: rf(22),
    fontWeight: '800',
    color: colors.text,
  },
  wordmarkDot: {
    color: colors.primary,
  },
  loginButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: rh(6),
  },
  loginButtonText: {
    fontSize: rf(13),
    fontWeight: '600',
    color: colors.text,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  heroTitle: {
    ...serifItalic,
    fontSize: rf(26),
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  heroTitleItalic: {
    ...serifItalic,
  },
  heroSubtitle: {
    fontSize: rf(12),
    color: colors.textMuted,
    marginTop: rh(4),
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: rw(150),
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: rf(15),
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  heading: {
    ...serifItalic,
    fontSize: rf(24),
    fontWeight: '700',
    color: colors.text,
  },
  quizPrompt: {
    paddingVertical: spacing.lg,
  },
  quizPromptSubtitle: {
    fontSize: rf(14),
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: rf(21),
  },
  quizButton: {
    backgroundColor: colors.text,
    borderRadius: radii.md,
    paddingVertical: rh(16),
    alignItems: 'center',
  },
  quizButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: rf(15),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLink: {
    fontSize: rf(13),
    fontWeight: '600',
    color: colors.primaryDark,
  },
  errorText: {
    fontSize: rf(14),
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '47%',
  },
  loading: {
    marginTop: spacing.lg,
  },
});
