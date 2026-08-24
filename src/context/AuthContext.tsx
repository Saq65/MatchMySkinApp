import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  clearAuthSession,
  getStoredAuthSession,
  saveAuthSession,
  type AuthSession,
} from '../services/authSession';
import { notifyNewUpdate, requestLocalNotificationPermission } from '../services/localNotifications';
import { setStoredNotificationsEnabled } from '../services/notificationPrefsStorage';
import { clearIdentifiedUser, identifyUser } from '../services/pushNotifications';

type AuthContextValue = {
  isLoggedIn: boolean;
  isLoading: boolean;
  session: AuthSession | null;
  userName: string | null;
  token: string | null;
  login: (session: AuthSession) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function displayName(session: AuthSession | null): string | null {
  if (!session) return null;
  const metadataName = session.user.user_metadata?.full_name;
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim();
  }
  return session.user.phone || session.user.email || null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStoredAuthSession()
      .then(stored => {
        if (!cancelled) {
          setSession(stored);
        }
      })
      .catch(err => console.warn('[authSession] read failed:', err))
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: session !== null,
      isLoading,
      session,
      userName: displayName(session),
      token: session?.token ?? null,
      login: (newSession: AuthSession) => {
        setSession(newSession);
        saveAuthSession(newSession).catch(err =>
          console.warn('[authSession] save failed:', err),
        );
        identifyUser(newSession.user.id);
        // Login is the first meaningful, contextual moment to ask for
        // notification permission (welcome/price-drop/wishlist alerts) --
        // a no-op if the OS already has an answer on file.
        requestLocalNotificationPermission()
          .then(granted => {
            if (granted) {
              setStoredNotificationsEnabled(true).catch(() => {});
              notifyNewUpdate(
                'Welcome to roopsee',
                "You're all set — we'll let you know about price drops and new arrivals.",
              );
            }
          })
          .catch(() => {});
      },
      logout: () => {
        setSession(null);
        clearAuthSession().catch(err => console.warn('[authSession] clear failed:', err));
        clearIdentifiedUser();
      },
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
