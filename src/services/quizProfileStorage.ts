import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizProfile } from './quizApi';

const QUIZ_PROFILE_KEY = 'matchmyskin.quizProfile';

export async function saveQuizProfile(profile: QuizProfile): Promise<void> {
  await AsyncStorage.setItem(QUIZ_PROFILE_KEY, JSON.stringify(profile));
}

export async function getStoredQuizProfile(): Promise<QuizProfile | null> {
  const raw = await AsyncStorage.getItem(QUIZ_PROFILE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as QuizProfile;
  } catch {
    return null;
  }
}
