import { apiRequest } from './apiClient';
import type { RetailerProduct } from '../types/product';

type RetailerProductsResponse = {
  products: RetailerProduct[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

// Powers general product search (SearchScreen) across the full retailer
// catalog. Sort/brand/category/price filtering lives client-side in
// matchesFilters.ts now, scoped to the smaller scored catalog that Products
// actually browses.
export async function fetchRetailerProducts(options: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<RetailerProductsResponse> {
  return apiRequest<RetailerProductsResponse>('/retailer-products', {
    query: {
      search: options.search,
      page: options.page,
      limit: options.limit,
    },
  });
}
