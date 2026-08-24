import { Ionicons } from '@react-native-vector-icons/ionicons/static';
import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MatchesFilterState, MatchesFacets } from '../services/matchesFilters';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../theme/colors';
import { rf, rh, rw } from '../theme/responsive';
import { radii, spacing } from '../theme/spacing';
import { useThemedStyles } from '../theme/useThemedStyles';

type Category = 'brand' | 'productType' | 'price' | 'score';

const CATEGORIES: Array<{ key: Category; label: string }> = [
  { key: 'brand', label: 'Brand' },
  { key: 'productType', label: 'Type' },
  { key: 'price', label: 'Price' },
  { key: 'score', label: 'Match' },
];

type Props = {
  visible: boolean;
  facets: MatchesFacets;
  value: MatchesFilterState;
  onApply: (value: MatchesFilterState) => void;
  onClose: () => void;
};

export function FilterSheet({ visible, facets, value, onApply, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<Category>('brand');
  const [draft, setDraft] = useState<MatchesFilterState>(value);
  const [brandSearch, setBrandSearch] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setBrandSearch('');
      setActiveCategory('brand');
    }
  }, [visible, value]);

  const toggle = (key: 'brands' | 'productTypes' | 'priceRanges', item: string) => {
    setDraft(prev => {
      const current = prev[key] as string[];
      const next = current.includes(item)
        ? current.filter(existing => existing !== item)
        : [...current, item];
      return { ...prev, [key]: next } as MatchesFilterState;
    });
  };

  const setMinScore = (score: number) => {
    setDraft(prev => ({ ...prev, minScore: prev.minScore === score ? null : score }));
  };

  const visibleBrands = facets.brand.filter(option =>
    option.label.toLowerCase().includes(brandSearch.trim().toLowerCase()),
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity
              onPress={() =>
                setDraft(prev => ({
                  brands: [],
                  productTypes: [],
                  bodyAreas: prev.bodyAreas,
                  priceRanges: [],
                  minScore: null,
                }))
              }
            >
              <Text style={styles.resetLink}>Reset Filters</Text>
            </TouchableOpacity>
          </View>

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
                    <Ionicons name="search-outline" size={rw(16)} color={colors.textMuted} />
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
                        onPress={() => toggle('brands', option.value)}
                      />
                    ))}
                  </ScrollView>
                </>
              )}

              {activeCategory === 'productType' && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {facets.productType.map(option => (
                    <CheckRow
                      key={option.value}
                      label={`${option.label} (${option.count})`}
                      checked={draft.productTypes.includes(option.value)}
                      onPress={() => toggle('productTypes', option.value)}
                    />
                  ))}
                </ScrollView>
              )}

              {activeCategory === 'price' && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {facets.price.map(option => (
                    <CheckRow
                      key={option.value}
                      label={`${option.label} (${option.count})`}
                      checked={draft.priceRanges.includes(option.value as never)}
                      onPress={() => toggle('priceRanges', option.value)}
                    />
                  ))}
                </ScrollView>
              )}

              {activeCategory === 'score' && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {facets.score.map(option => (
                    <CheckRow
                      key={option.value}
                      label={`${option.label} (${option.count})`}
                      checked={draft.minScore === Number(option.value)}
                      onPress={() => setMinScore(Number(option.value))}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          </View>

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
  const { colors } = useTheme();
  const styles = useThemedStyles(colors, createStyles);
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={rw(13)} color={colors.surface} />}
      </View>
      <Text style={styles.checkRowLabel} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      fontSize: rf(17),
      fontWeight: '700',
      color: colors.text,
    },
    resetLink: {
      fontSize: rf(13),
      fontWeight: '600',
      color: colors.primaryDark,
    },
    body: {
      flex: 1,
      flexDirection: 'row',
    },
    tabs: {
      width: rw(100),
      backgroundColor: colors.background,
    },
    tab: {
      paddingVertical: rh(16),
      paddingHorizontal: spacing.md,
    },
    tabActive: {
      backgroundColor: colors.surface,
    },
    tabLabel: {
      fontSize: rf(13),
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
      paddingVertical: rh(8),
      fontSize: rf(13),
      color: colors.text,
    },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: rh(10),
      gap: spacing.sm,
    },
    checkbox: {
      width: rw(18),
      height: rw(18),
      borderRadius: rw(4),
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
      fontSize: rf(13),
      color: colors.text,
      flexShrink: 1,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    closeButton: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: radii.lg,
      paddingVertical: rh(14),
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: rf(14),
      fontWeight: '700',
      color: colors.primary,
    },
    applyButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: radii.lg,
      paddingVertical: rh(14),
      alignItems: 'center',
    },
    applyButtonText: {
      fontSize: rf(14),
      fontWeight: '700',
      color: colors.surface,
    },
  });
