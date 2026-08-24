import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProductCard } from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { getGuestSessionId } from '../services/guestSession';
import { fetchRecommendedProducts, submitQuizResult } from '../services/quizApi';
import { saveQuizProfile } from '../services/quizProfileStorage';
import type { RootStackParamList } from '../navigation/types';
import { productFromRoutine, type Product } from '../types/product';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResults'>;

export function ResultsScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const { profile } = route.params;
  const { isWishlisted, toggleWishlist } = useShop();
  const [matches, setMatches] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    saveQuizProfile(profile).catch(err =>
      console.warn('[quizProfileStorage] save failed:', err),
    );

    getGuestSessionId()
      .then(guestSessionId => submitQuizResult(profile, guestSessionId))
      .catch(err => console.warn('[quiz-results] save failed:', err.message));

    fetchRecommendedProducts(profile)
      .then(products => {
        if (!cancelled) {
          setMatches(products.map(productFromRoutine));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Couldn't load your matches. Check your connection.</Text>
          <PrimaryButton label="Retake the quiz" onPress={() => navigation.replace('Quiz')} />
        </View>
      ) : !matches ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Your top skin matches</Text>
            <Text style={styles.subtitle}>Personalized to your quiz answers.</Text>

            <View style={styles.grid}>
              {matches.map(match => (
                <View key={match.id} style={styles.gridItem}>
                  <ProductCard
                    product={match}
                    wishlisted={isWishlisted(match.id)}
                    onPress={() => navigation.navigate('ProductDetails', { product: match })}
                    onToggleWishlist={() => toggleWishlist(match)}
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Main', { screen: 'Products' })}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllButtonText}>View all products</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.footer}>
            <PrimaryButton label="Retake the quiz" onPress={() => navigation.replace('Quiz')} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rw(24),
    gap: rw(16),
  },
  errorText: {
    fontSize: rf(15),
    color: colors.textMuted,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: rf(24),
    fontWeight: '700',
    color: colors.text,
    marginBottom: rh(6),
  },
  subtitle: {
    fontSize: rf(14),
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: rf(20),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    rowGap: spacing.xl,
  },
  gridItem: {
    width: '47%',
  },
  viewAllButton: {
    borderWidth: 1.5,
    borderColor: colors.text,
    borderRadius: rw(14),
    paddingVertical: rh(14),
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  viewAllButtonText: {
    fontSize: rf(14),
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
});
