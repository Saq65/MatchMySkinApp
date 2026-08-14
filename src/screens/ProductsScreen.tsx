import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { fetchProductFacets, type ProductFacets } from '../services/facetsApi';
import {
  EMPTY_FILTERS,
  fetchRetailerProducts,
  type ProductFilterState,
  type SortOption,
} from '../services/productsApi';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { productFromRetailer, type Product } from '../types/product';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Products'>,
  NativeStackScreenProps<RootStackParamList>
>;

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest',
  rating: 'Top rated',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  name_asc: 'Name: A to Z',
};

function activeFilterCount(filters: ProductFilterState): number {
  return (
    filters.brands.length +
    filters.categories.length +
    filters.priceRanges.length +
    (filters.minRating !== null ? 1 : 0)
  );
}

export function ProductsScreen({ navigation, route }: Props) {
  const { width } = useWindowDimensions();
  const numColumns = width >= 700 ? 4 : width >= 500 ? 3 : 2;
  const { isWishlisted, toggleWishlist } = useShop();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  const [sort, setSort] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<ProductFilterState>(EMPTY_FILTERS);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [facets, setFacets] = useState<ProductFacets | null>(null);
  const [facetsLoading, setFacetsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFacetsLoading(true);
    fetchProductFacets()
      .then(response => {
        if (!cancelled) {
          setFacets(response);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setFacetsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const initialCategory = route.params?.category;

  // Home's "Search by product" cards pass a category to jump straight into;
  // react to it even if the Products tab is already mounted from a previous visit.
  useEffect(() => {
    if (initialCategory) {
      setFilters(prev => ({ ...prev, categories: [initialCategory] }));
    }
  }, [initialCategory]);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    setError(false);
    fetchRetailerProducts({
      limit: 40,
      sort,
      brand: filters.brands.length ? filters.brands : undefined,
      category: filters.categories.length ? filters.categories : undefined,
      priceRanges: filters.priceRanges.length ? filters.priceRanges : undefined,
      minRating: filters.minRating ?? undefined,
    })
      .then(response => {
        if (cancelled) return;
        let items = response.products.map(productFromRetailer);
        if (sort === 'name_asc') {
          items = [...items].sort((a, b) => a.name.localeCompare(b.name));
        }
        setProducts(items);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sort, filters]);

  const filterCount = activeFilterCount(filters);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop products</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={() => setSortOpen(true)}>
          <Ionicons name="swap-vertical-outline" size={15} color={colors.text} />
          <View>
            <Text style={styles.toolbarLabel}>Sort By</Text>
            <Text style={styles.toolbarValue}>{SORT_LABELS[sort]}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={() => setFilterOpen(true)}>
          <Ionicons name="filter-outline" size={15} color={colors.text} />
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
      ) : !products ? (
        <ActivityIndicator color={colors.text} style={styles.loading} />
      ) : products.length === 0 ? (
        <Text style={styles.errorText}>No products match these filters.</Text>
      ) : (
        <FlatList
          key={numColumns}
          data={products}
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

      <SortSheet
        visible={sortOpen}
        value={sort}
        onApply={setSort}
        onClose={() => setSortOpen(false)}
      />
      <FilterSheet
        visible={filterOpen}
        facets={facets}
        loadingFacets={facetsLoading}
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
    fontSize: 22,
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
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  toolbarValue: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
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
