import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { useShop } from '../context/ShopContext';
import { fetchRetailerProducts } from '../services/productsApi';
import type { RootStackParamList } from '../navigation/types';
import { productFromRetailer, type Product } from '../types/product';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { isWishlisted, toggleWishlist } = useShop();

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchRetailerProducts({ search: trimmed, limit: 30 })
        .then(response => {
          if (!cancelled) {
            setResults(response.products.map(productFromRetailer));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Search" onBack={() => navigation.goBack()} />

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search products, brands, categories"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {query.trim().length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Search MatchMySkin"
          subtitle="Try a brand, product name, or category like 'toner'."
        />
      ) : loading ? (
        <ActivityIndicator color={colors.text} style={styles.loading} />
      ) : results.length === 0 ? (
        <EmptyState icon="sad-outline" title="No results" subtitle={`Nothing matched "${query}"`} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const wishlisted = isWishlisted(item.id);
            return (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
                activeOpacity={0.85}
              >
                <Ionicons name="flask-outline" size={22} color={colors.textMuted} />
                <View style={styles.resultInfo}>
                  <Text style={styles.resultBrand} numberOfLines={1}>
                    {item.brand}
                  </Text>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleWishlist(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={wishlisted ? 'heart' : 'heart-outline'}
                    size={20}
                    color={wishlisted ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
  },
  loading: {
    marginTop: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  resultInfo: {
    flex: 1,
    minWidth: 0,
  },
  resultBrand: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 1,
  },
});
