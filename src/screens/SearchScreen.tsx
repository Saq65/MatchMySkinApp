import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Asset } from 'react-native-image-picker';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { SearchByPhotoModal } from '../components/SearchByPhotoModal';
import { useShop } from '../context/ShopContext';
import { useTheme } from '../context/ThemeContext';
import { fetchRetailerProducts } from '../services/productsApi';
import { searchByImage, type VisualSearchPhoto } from '../services/visualSearchApi';
import type { RootStackParamList } from '../navigation/types';
import { productFromRetailer, type Product } from '../types/product';
import type { ThemeColors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

type SearchMode = 'idle' | 'text' | 'photo';

export function SearchScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [mode, setMode] = useState<SearchMode>('idle');
  const [photoPreviewUri, setPhotoPreviewUri] = useState<string | null>(null);
  const { isWishlisted, toggleWishlist } = useShop();

  const runVisualSearch = useCallback(async (photo: VisualSearchPhoto) => {
    setQuery('');
    setMode('photo');
    setPhotoPreviewUri(photo.uri);
    setLoading(true);
    try {
      const response = await searchByImage(photo);
      setResults(response.products.map(productFromRetailer));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onPhotoSelected = useCallback(
    (asset: Asset) => {
      if (!asset.uri) return;
      runVisualSearch({ uri: asset.uri, type: asset.type, fileName: asset.fileName });
    },
    [runVisualSearch],
  );

  useEffect(() => {
    const photoUri = route.params?.photoUri;
    if (photoUri) {
      runVisualSearch({
        uri: photoUri,
        type: route.params?.photoType,
        fileName: route.params?.photoFileName,
      });
    }
  }, [route.params?.photoUri, route.params?.photoType, route.params?.photoFileName, runVisualSearch]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      if (mode === 'text') {
        setMode('idle');
        setResults([]);
        setLoading(false);
      }
      return;
    }

    setMode('text');
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
  }, [query, mode]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setMode('idle');
    setResults([]);
    setPhotoPreviewUri(null);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (mode === 'photo' && photoPreviewUri) {
        const response = await searchByImage({ uri: photoPreviewUri });
        setResults(response.products.map(productFromRetailer));
      } else {
        const trimmed = query.trim();
        if (!trimmed) return;
        const response = await fetchRetailerProducts({ search: trimmed, limit: 30 });
        setResults(response.products.map(productFromRetailer));
      }
    } catch {
      setResults([]);
    } finally {
      setRefreshing(false);
    }
  }, [query, mode, photoPreviewUri]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScreenHeader title="Search" onBack={() => navigation.goBack()} />

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={rw(18)} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Search products, brands, categories"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoFocus
          returnKeyType="search"
        />
        {(query.length > 0 || mode === 'photo') && (
          <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-outline" size={rw(18)} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setPhotoModalVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="camera-outline" size={rw(18)} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <SearchByPhotoModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onPhotoSelected={onPhotoSelected}
      />

      {mode === 'photo' && photoPreviewUri && (
        <View style={styles.photoPreviewRow}>
          <Image source={{ uri: photoPreviewUri }} style={styles.photoPreviewThumb} resizeMode="cover" />
          <Text style={styles.photoPreviewText}>Results from your photo</Text>
        </View>
      )}

      {mode === 'idle' ? (
        <EmptyState
          icon="search-outline"
          title="Search roopsee"
          subtitle="Try a brand, product name, or category like 'toner'."
        />
      ) : loading ? (
        <ActivityIndicator color={colors.text} style={styles.loading} />
      ) : results.length === 0 ? (
        <EmptyState
          icon="sad-outline"
          title="No results"
          subtitle={mode === 'photo' ? "We couldn't match any products from your photo." : `Nothing matched "${query}"`}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const wishlisted = isWishlisted(item.id);
            return (
              <TouchableOpacity
                style={styles.resultRow}
                onPress={() => navigation.navigate('ProductDetails', { product: item })}
                activeOpacity={0.85}
              >
                <Ionicons name="flask-outline" size={rw(22)} color={colors.textMuted} />
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
                    size={rw(20)}
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

const createStyles = (colors: ThemeColors) => StyleSheet.create({
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
    fontSize: rf(15),
    color: colors.text,
  },
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  photoPreviewThumb: {
    width: rw(32),
    height: rw(32),
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
  },
  photoPreviewText: {
    fontSize: rf(13),
    fontWeight: '600',
    color: colors.textMuted,
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
    fontSize: rf(11),
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  resultName: {
    fontSize: rf(14),
    fontWeight: '600',
    color: colors.text,
    marginTop: rh(1),
  },
});
