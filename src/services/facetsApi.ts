import { apiRequest } from './apiClient';

export type FacetOption = {
  value: string;
  label: string;
  count: number;
};

export type ProductFacets = {
  options: {
    brand: FacetOption[];
    price: FacetOption[];
    category: FacetOption[];
    rating: FacetOption[];
    country: FacetOption[];
  };
  total: number;
};

export async function fetchProductFacets(): Promise<ProductFacets> {
  return apiRequest<ProductFacets>('/retailer-products/facets');
}
