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

type RecommendResponse = {
  // The full scored catalog (score-desc sorted, capped at `limit`) — the
  // `routine` field alongside this is a curated AM/PM slot picker built from
  // the same data and isn't what we want for a general "your matches" list.
  products: RoutineProduct[];
  total_matches: number;
};

export async function fetchRecommendedProducts(
  profile: QuizProfile,
  limit = 24,
): Promise<RoutineProduct[]> {
  const response = await apiRequest<RecommendResponse>('/recommend', {
    method: 'POST',
    body: { ...profile, limit },
  });

  return response.products;
}
