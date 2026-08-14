import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'matchmyskin.authSession';

export type AuthUser = {
  id: string;
  phone?: string | null;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export type AuthSession = {
  token: string;
  refreshToken: string;
  user: AuthUser;
};

export async function saveAuthSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getStoredAuthSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
