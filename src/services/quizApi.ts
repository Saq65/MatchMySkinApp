import { apiRequest } from './apiClient';
import type { RoutineProduct } from '../types/product';

export type QuizOptions = {
  skinTypes: string[];
  sensitivityOptions: string[];
  faceBodyConcerns: string[];
  lipsEyesConcerns: string[];
  specialConditions: string[];
  ages: string[];
  genders: string[];
};

export type QuizProfile = {
  age: string;
  selectedGender: string;
  selectedSkinType: string;
  selectedSensitive: boolean;
  selectedFaceBodyConcerns: string[];
  selectedLipsEyesConcerns: string[];
  selectedSpecialConditions: string[];
};

type OptionsResponse = {
  quiz_options: QuizOptions;
};

export async function fetchQuizOptions(): Promise<QuizOptions> {
  const response = await apiRequest<OptionsResponse>('/options');
  return response.quiz_options;
}

type QuizResultResponse = {
  ok: boolean;
  result: { id: string; quiz_number: number; completed_at: string };
};

export async function submitQuizResult(
  profile: QuizProfile,
  guestSessionId: string,
): Promise<QuizResultResponse> {
  return apiRequest<QuizResultResponse>('/quiz-results', {
    method: 'POST',
    body: { profile, guestSessionId },
  });
}

type RoutineEntry = {
  tier: string;
  period: 'am' | 'pm';
  slot: string;
  label: string;
  product: RoutineProduct;
};

type RoutineTier = {
  label: string;
  description: string;
  am?: RoutineEntry[];
  pm?: RoutineEntry[];
};

type RecommendResponse = {
  routine: {
    tiers: Record<string, RoutineTier>;
  };
};

export async function fetchRecommendedProducts(
  profile: QuizProfile,
  limit = 24,
): Promise<RoutineProduct[]> {
  const response = await apiRequest<RecommendResponse>('/recommend', {
    method: 'POST',
    body: { ...profile, limit },
  });

  const byId = new Map<string, RoutineProduct>();
  Object.values(response.routine?.tiers || {}).forEach(tier => {
    [...(tier.am || []), ...(tier.pm || [])].forEach(entry => {
      if (entry.product) {
        byId.set(entry.product.product_uid, entry.product);
      }
    });
  });

  return [...byId.values()].sort((a, b) => b.score - a.score);
}
