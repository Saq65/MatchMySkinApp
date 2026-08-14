import { apiRequest } from './apiClient';

export type ProductOffer = {
  id: number | string;
  site: string;
  brand: string;
  product_name: string;
  full_product_name: string;
  variant?: string;
  price: number;
  mrp?: number;
  product_url: string;
  image_url?: string;
  in_stock?: boolean;
};

type OffersResponse = {
  offers: ProductOffer[];
  matched: boolean;
  cheapest: number | null;
};

export async function fetchProductOffers(productUid: string): Promise<OffersResponse> {
  return apiRequest<OffersResponse>('/product-offers', {
    query: { uid: productUid },
  });
}
