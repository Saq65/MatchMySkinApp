import type { Product } from '../types/product';

export type PriceRange = 'under_500' | '500_1000' | 'over_1000';

export type MatchesFilterState = {
  brands: string[];
  productTypes: string[];
  bodyAreas: string[];
  priceRanges: PriceRange[];
  minScore: number | null;
};

export const EMPTY_MATCHES_FILTERS: MatchesFilterState = {
  brands: [],
  productTypes: [],
  bodyAreas: [],
  priceRanges: [],
  minScore: null,
};

export type MatchesFacetOption = {
  value: string;
  label: string;
  count: number;
};

export type MatchesFacets = {
  brand: MatchesFacetOption[];
  productType: MatchesFacetOption[];
  price: MatchesFacetOption[];
  score: MatchesFacetOption[];
};

function priceRangeOf(price: number): PriceRange {
  if (price < 500) return 'under_500';
  if (price <= 1000) return '500_1000';
  return 'over_1000';
}

const PRICE_LABELS: Record<PriceRange, string> = {
  under_500: 'Under ₹500',
  '500_1000': '₹500 – ₹1,000',
  over_1000: 'Over ₹1,000',
};

const SCORE_TIERS = [90, 80, 70, 50];

export function computeMatchesFacets(products: Product[]): MatchesFacets {
  const brandCounts = new Map<string, number>();
  const typeCounts = new Map<string, number>();
  const priceCounts = new Map<PriceRange, number>();

  products.forEach(product => {
    brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
    typeCounts.set(product.category, (typeCounts.get(product.category) ?? 0) + 1);
    const range = priceRangeOf(product.price);
    priceCounts.set(range, (priceCounts.get(range) ?? 0) + 1);
  });

  const scoreOptions = SCORE_TIERS.map(tier => ({
    value: String(tier),
    label: `${tier}%+ match`,
    count: products.filter(p => (p.matchScore ?? 0) >= tier).length,
  })).filter(option => option.count > 0);

  return {
    brand: [...brandCounts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    productType: [...typeCounts.entries()]
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count),
    price: (['under_500', '500_1000', 'over_1000'] as PriceRange[])
      .filter(range => (priceCounts.get(range) ?? 0) > 0)
      .map(range => ({ value: range, label: PRICE_LABELS[range], count: priceCounts.get(range)! })),
    score: scoreOptions,
  };
}

export function applyMatchesFilters(products: Product[], filters: MatchesFilterState): Product[] {
  return products.filter(product => {
    if (filters.brands.length && !filters.brands.includes(product.brand)) return false;
    if (filters.productTypes.length && !filters.productTypes.includes(product.category))
      return false;
    if (
      filters.bodyAreas.length &&
      !(product.bodyArea && filters.bodyAreas.includes(product.bodyArea))
    )
      return false;
    if (
      filters.priceRanges.length &&
      !filters.priceRanges.includes(priceRangeOf(product.price))
    )
      return false;
    if (filters.minScore !== null && (product.matchScore ?? 0) < filters.minScore) return false;
    return true;
  });
}

export function activeMatchesFilterCount(filters: MatchesFilterState): number {
  return (
    filters.brands.length +
    filters.productTypes.length +
    filters.bodyAreas.length +
    filters.priceRanges.length +
    (filters.minScore !== null ? 1 : 0)
  );
}
