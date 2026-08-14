import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterSheet } from '../components/FilterSheet';
import { ProductCard } from '../components/ProductCard';
import { SortSheet } from '../components/SortSheet';
import { useShop } from '../context/ShopContext';
import { fetchRecommendedProducts, type QuizProfile } from '../services/quizApi';
import { getStoredQuizProfile } from '../services/quizProfileStorage';
import {
  activeMatchesFilterCount,
  applyMatchesFilters,
  computeMatchesFacets,
  EMPTY_MATCHES_FILTERS,
  type MatchesFilterState,
} from '../services/matchesFilters';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { productFromRoutine, type Product } from '../types/product';
import { colors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Products'>,
  NativeStackScreenProps<RootStackParamList>
>;

type SortOption = 'score_desc' | 'score_asc' | 'price_asc' | 'price_desc' | 'name_asc';

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'score_desc', label: 'Best match' },
  { value: 'score_asc', label: 'Lowest match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];

const SORT_LABELS: Record<SortOption, string> = {
  score_desc: 'Best match',
  score_asc: 'Lowest match',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  name_asc: 'Name: A to Z',
};

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'score_desc':
      return sorted.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
    case 'score_asc':
      return sorted.sort((a, b) => (a.matchScore ?? 0) - (b.matchScore ?? 0));
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name_asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function ProductsScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const numColumns = width >= 700 ? 4 : width >= 500 ? 3 : 2;
  const { isWishlisted, toggleWishlist } = useShop();

  const [quizProfile, setQuizProfile] = useState<QuizProfile | null | undefined>(undefined);
  const [allMatches, setAllMatches] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [sort, setSort] = useState<SortOption>('score_desc');
  const [filters, setFilters] = useState<MatchesFilterState>(EMPTY_MATCHES_FILTERS);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Re-check on every focus so completing the quiz and coming back here
  // immediately unlocks the catalog, without needing a remount.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getStoredQuizProfile()
        .then(stored => {
          if (!cancelled) {
            setQuizProfile(stored);
          }
        })
        .catch(err => {
          console.warn('[quizProfileStorage] read failed:', err);
          if (!cancelled) {
            setQuizProfile(null);
          }
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useEffect(() => {
    if (!quizProfile) {
      setAllMatches(null);
      return;
    }
    let cancelled = false;
    setAllMatches(null);
    setError(false);
    fetchRecommendedProducts(quizProfile, 409)
      .then(items => {
        if (!cancelled) {
          setAllMatches(items.map(productFromRoutine));
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
  }, [quizProfile]);

  const bodyArea = route.params?.bodyArea;
  const productType = route.params?.productType;
  const brand = route.params?.brand;

  // Home's "Search by category/product" cards pass a body area or product
  // type to jump straight into (or null to explicitly clear it, e.g. "Face"
  // has no distinct body-area tag of its own). React to it even if this tab
  // is already mounted from a previous visit. `undefined` means "no param at
  // all" — e.g. pressing the tab directly — so leave filters as they were.
  useEffect(() => {
    if (bodyArea === undefined) return;
    setFilters(prev => ({
      ...prev,
      bodyAreas: bodyArea ? [bodyArea] : [],
    }));
  }, [bodyArea]);

  useEffect(() => {
    if (productType === undefined) return;
    setFilters(prev => ({
      ...prev,
      productTypes: productType ? [productType] : [],
    }));
  }, [productType]);

  useEffect(() => {
    if (brand === undefined) return;
    setFilters(prev => ({
      ...prev,
      brands: brand ? [brand] : [],
    }));
  }, [brand]);

  const facets = useMemo(() => computeMatchesFacets(allMatches ?? []), [allMatches]);
  const displayed = useMemo(() => {
    if (!allMatches) return null;
    return sortProducts(applyMatchesFilters(allMatches, filters), sort);
  }, [allMatches, filters, sort]);

  const filterCount = activeMatchesFilterCount(filters);

  const onRefresh = useCallback(async () => {
    if (!quizProfile) return;
    setRefreshing(true);
    try {
      const items = await fetchRecommendedProducts(quizProfile, 409);
      setAllMatches(items.map(productFromRoutine));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, [quizProfile]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop products</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="search-outline" size={rw(24)} color={colors.text} />
        </TouchableOpacity>
      </View>

      {quizProfile === null ? (
        <View style={styles.centered}>
          <Text style={styles.promptText}>
            Take the skin quiz to see products scored specifically for you.
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
          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolbarButton} onPress={() => setSortOpen(true)}>
              <Ionicons name="swap-vertical-outline" size={rw(15)} color={colors.text} />
              <View>
                <Text style={styles.toolbarLabel}>Sort By</Text>
                <Text style={styles.toolbarValue}>{SORT_LABELS[sort]}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarButton} onPress={() => setFilterOpen(true)}>
              <Ionicons name="filter-outline" size={rw(15)} color={colors.text} />
              <View>
                <Text style={styles.toolbarLabel}>Filter</Text>
                <Text style={styles.toolbarValue}>
                  {filterCount > 0 ? `${filterCount} applied` : 'Apply filter'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={styles.errorText}>Couldn't load products. Check your connection.</Text>
          ) : !displayed ? (
            <ActivityIndicator color={colors.text} style={styles.loading} />
          ) : displayed.length === 0 ? (
            <Text style={styles.errorText}>No matches found.</Text>
          ) : (
            <FlatList
              key={numColumns}
              data={displayed}
              keyExtractor={item => item.id}
              numColumns={numColumns}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
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
        </>
      )}

      <SortSheet
        visible={sortOpen}
        value={sort}
        options={SORT_OPTIONS}
        onApply={setSort}
        onClose={() => setSortOpen(false)}
      />
      <FilterSheet
        visible={filterOpen}
        facets={facets}
        value={filters}
        onApply={setFilters}
        onClose={() => setFilterOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: rf(22),
    fontWeight: '700',
    color: colors.text,
  },
  toolbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  toolbarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  toolbarLabel: {
    fontSize: rf(12),
    fontWeight: '700',
    color: colors.text,
  },
  toolbarValue: {
    fontSize: rf(11),
    color: colors.textMuted,
    marginTop: rh(1),
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  promptText: {
    fontSize: rf(14),
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: rf(20),
  },
  quizButton: {
    backgroundColor: colors.text,
    borderRadius: radii.md,
    paddingVertical: rh(14),
    paddingHorizontal: spacing.xl,
  },
  quizButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: rf(14),
  },
  errorText: {
    paddingHorizontal: spacing.lg,
    color: colors.textMuted,
  },
  loading: {
    marginTop: spacing.lg,
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
