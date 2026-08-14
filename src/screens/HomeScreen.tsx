import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { SearchByProduct } from '../components/SearchByProduct';
import AnnouncementBar from '../components/TickerBar';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { fetchRecommendedProducts, type QuizProfile } from '../services/quizApi';
import { getStoredQuizProfile } from '../services/quizProfileStorage';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { productFromRoutine, type Product } from '../types/product';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { serifItalic } from '../theme/typography';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { isLoggedIn } = useAuth();
  const { isWishlisted, toggleWishlist } = useShop();
  const [profile, setProfile] = useState<QuizProfile | null | undefined>(undefined);
  const [matches, setMatches] = useState<Product[] | null>(null);
  const [matchesError, setMatchesError] = useState(false);

  // Re-check on every focus so completing the quiz and coming back to this
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
    fetchRecommendedProducts(profile)
      .then(products => {
        if (!cancelled) {
          setMatches(products.map(productFromRoutine));
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        <SearchByProduct
          onSelect={category => navigation.navigate('Products', { category })}
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
    fontSize: 22,
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
    paddingVertical: 6,
  },
  loginButtonText: {
    fontSize: 13,
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
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  heroTitleItalic: {
    ...serifItalic,
  },
  heroSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: 150,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  heading: {
    ...serifItalic,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  quizPrompt: {
    paddingVertical: spacing.lg,
  },
  quizPromptSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  quizButton: {
    backgroundColor: colors.text,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  quizButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  errorText: {
    fontSize: 14,
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
