import { apiRequest } from './apiClient';
import type { RetailerProduct } from '../types/product';

type VisualSearchResponse = {
  products: RetailerProduct[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type VisualSearchPhoto = {
  uri: string;
  type?: string;
  fileName?: string;
};

export async function searchByImage(photo: VisualSearchPhoto): Promise<VisualSearchResponse> {
  const formData = new FormData();
  formData.append('image', {
    uri: photo.uri,
    type: photo.type ?? 'image/jpeg',
    name: photo.fileName ?? 'photo.jpg',
  });

  return apiRequest<VisualSearchResponse>('/visual-search', {
    method: 'POST',
    body: formData,
  });
}
