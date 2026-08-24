import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from '../theme/colors';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Scheme = 'light' | 'dark';

const THEME_PREFERENCE_KEY = 'matchmyskin.themePreference';

type ThemeContextValue = {
  colors: ThemeColors;
  scheme: Scheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREFERENCE_KEY)
      .then(stored => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      })
      .catch(err => console.warn('[themePreference] read failed:', err));
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(THEME_PREFERENCE_KEY, next).catch(err =>
      console.warn('[themePreference] save failed:', err),
    );
  };

  const scheme: Scheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({ colors, scheme, preference, setPreference }),
    [colors, scheme, preference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
