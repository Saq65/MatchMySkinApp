import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ProductFacets } from '../services/facetsApi';
import type { PriceRange, ProductFilterState } from '../services/productsApi';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

type Category = 'brand' | 'price' | 'category' | 'rating';

const CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: 'brand', label: 'Brand' },
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' },
  { key: 'rating', label: 'Rating' },
];

type Props = {
  visible: boolean;
  facets: ProductFacets | null;
  loadingFacets: boolean;
  value: ProductFilterState;
  onApply: (value: ProductFilterState) => void;
  onClose: () => void;
};

export function FilterSheet({ visible, facets, loadingFacets, value, onApply, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<Category>('brand');
  const [draft, setDraft] = useState<ProductFilterState>(value);
  const [brandSearch, setBrandSearch] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setBrandSearch('');
      setActiveCategory('brand');
    }
  }, [visible, value]);

  const toggleBrand = (brand: string) => {
    setDraft(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(item => item !== brand)
        : [...prev.brands, brand],
    }));
  };

  const toggleCategory = (category: string) => {
    setDraft(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(item => item !== category)
        : [...prev.categories, category],
    }));
  };

  const togglePriceRange = (range: PriceRange) => {
    setDraft(prev => ({
      ...prev,
      priceRanges: prev.priceRanges.includes(range)
        ? prev.priceRanges.filter(item => item !== range)
        : [...prev.priceRanges, range],
    }));
  };

  const setMinRating = (rating: number) => {
    setDraft(prev => ({
      ...prev,
      minRating: prev.minRating === rating ? null : rating,
    }));
  };

  const visibleBrands = (facets?.options.brand ?? []).filter(option =>
    option.label.toLowerCase().includes(brandSearch.trim().toLowerCase()),
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={() => setDraft({ brands: [], categories: [], priceRanges: [], minRating: null })}>
              <Text style={styles.resetLink}>Reset Filters</Text>
            </TouchableOpacity>
          </View>

          {loadingFacets ? (
            <ActivityIndicator color={colors.text} style={styles.loading} />
          ) : (
            <View style={styles.body}>
              <View style={styles.tabs}>
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.key}
                    style={[styles.tab, activeCategory === category.key && styles.tabActive]}
                    onPress={() => setActiveCategory(category.key)}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        activeCategory === category.key && styles.tabLabelActive,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.panel}>
                {activeCategory === 'brand' && (
                  <>
                    <View style={styles.searchBar}>
                      <Ionicons name="search-outline" size={16} color={colors.textMuted} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Search brand"
                        placeholderTextColor={colors.textMuted}
                        value={brandSearch}
                        onChangeText={setBrandSearch}
                      />
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {visibleBrands.map(option => (
                        <CheckRow
                          key={option.value}
                          label={`${option.label} (${option.count})`}
                          checked={draft.brands.includes(option.value)}
                          onPress={() => toggleBrand(option.value)}
                        />
                      ))}
                    </ScrollView>
                  </>
                )}

                {activeCategory === 'category' && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {(facets?.options.category ?? []).map(option => (
                      <CheckRow
                        key={option.value}
                        label={`${option.label} (${option.count})`}
                        checked={draft.categories.includes(option.value)}
                        onPress={() => toggleCategory(option.value)}
                      />
                    ))}
                  </ScrollView>
                )}

                {activeCategory === 'price' && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {(facets?.options.price ?? []).map(option => (
                      <CheckRow
                        key={option.value}
                        label={`${option.label} (${option.count})`}
                        checked={draft.priceRanges.includes(option.value as PriceRange)}
                        onPress={() => togglePriceRange(option.value as PriceRange)}
                      />
                    ))}
                  </ScrollView>
                )}

                {activeCategory === 'rating' && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {(facets?.options.rating ?? []).map(option => (
                      <CheckRow
                        key={option.value}
                        label={`${option.label} (${option.count})`}
                        checked={draft.minRating === Number(option.value)}
                        onPress={() => setMinRating(Number(option.value))}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          )}

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                onApply(draft);
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CheckRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={13} color={colors.surface} />}
      </View>
      <Text style={styles.checkRowLabel} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '75%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  resetLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  loading: {
    marginTop: spacing.xl,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  tabs: {
    width: 110,
    backgroundColor: colors.background,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  panel: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.text,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  checkRowLabel: {
    fontSize: 13,
    color: colors.text,
    flexShrink: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  applyButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
});
