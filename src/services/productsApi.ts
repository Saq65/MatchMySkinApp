import { apiRequest } from './apiClient';
import type { RetailerProduct } from '../types/product';

export type SortOption = 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'name_asc';
export type PriceRange = 'under_500' | '500_1000' | 'over_1000';

export type ProductFilterState = {
  brands: string[];
  categories: string[];
  priceRanges: PriceRange[];
  minRating: number | null;
};

export const EMPTY_FILTERS: ProductFilterState = {
  brands: [],
  categories: [],
  priceRanges: [],
  minRating: null,
};

type RetailerProductsResponse = {
  products: RetailerProduct[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function fetchRetailerProducts(options: {
  search?: string;
  page?: number;
  limit?: number;
  sort?: SortOption;
  brand?: string[];
  category?: string[];
  priceRanges?: PriceRange[];
  minRating?: number;
}): Promise<RetailerProductsResponse> {
  return apiRequest<RetailerProductsResponse>('/retailer-products', {
    query: {
      search: options.search,
      page: options.page,
      limit: options.limit,
      // 'newest' is the API's default; 'name_asc' has no server-side support
      // and is applied client-side on the returned page instead.
      sort:
        options.sort === 'newest' || options.sort === 'name_asc' ? undefined : options.sort,
      brand: options.brand,
      category: options.category,
      price: options.priceRanges,
      rating: options.minRating,
    },
  });
}
