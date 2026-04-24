import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearAuthSession,
  decodeJwtPayload,
  getStoredAccessToken,
  getStoredAuthUser,
  refreshAuthSession,
  setAuthSession,
} from '../utils/auth';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

const AuthContext = createContext(null);

const readStoredSession = () => ({
  accessToken: getStoredAccessToken(),
  user: (() => {
    const storedUser = getStoredAuthUser();
    if (storedUser) return storedUser;

    const token = getStoredAccessToken();
    const payload = decodeJwtPayload(token);

    if (!payload?.sub) return null;

    return {
      id: payload.sub,
      name: payload.email?.split('@')[0] || 'Student',
      email: payload.email || '',
    };
  })(),
});

export function AuthProvider({ children }) {
  const initialSession = useMemo(readStoredSession, []);
  const [authState, setAuthState] = useState(initialSession);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [purchasedCoursesLoading, setPurchasedCoursesLoading] = useState(
    Boolean(initialSession.accessToken),
  );
  const [purchasedCoursesError, setPurchasedCoursesError] = useState('');

  const syncAuthFromStorage = useCallback(() => {
    setAuthState(readStoredSession());
  }, []);

  const setSession = useCallback(({ accessToken, user } = {}) => {
    setAuthSession({ accessToken, user });
    setAuthState({
      accessToken: accessToken || '',
      user: user || null,
    });
  }, []);

  const completeGoogleAuth = useCallback(async (accessToken) => {
    if (accessToken) {
      setAuthSession({ accessToken });
    }

    const session = await refreshAuthSession(API_BASE_URL);
    setAuthState({
      accessToken: session.accessToken || getStoredAccessToken(),
      user: session.user || getStoredAuthUser(),
    });

    return session;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Clearing the local session is still the important part here.
    } finally {
      clearAuthSession();
      setAuthState({
        accessToken: '',
        user: null,
      });
      setPurchasedCourses([]);
      setPurchasedCoursesError('');
    }
  }, []);

  const refreshPurchasedCourses = useCallback(async (session = authState) => {
    if (!session?.accessToken) {
      setPurchasedCourses([]);
      setPurchasedCoursesError('');
      setPurchasedCoursesLoading(false);
      return [];
    }

    setPurchasedCoursesLoading(true);
    setPurchasedCoursesError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/courses/purchased`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        credentials: 'include',
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || 'Failed to load purchased courses');
      }

      setPurchasedCourses(payload.data || []);
      return payload.data || [];
    } catch (error) {
      setPurchasedCourses([]);
      setPurchasedCoursesError(error.message || 'Failed to load purchased courses');
      return [];
    } finally {
      setPurchasedCoursesLoading(false);
    }
  }, [authState]);

  useEffect(() => {
    const hasSession = Boolean(authState.accessToken);

    if (!hasSession) {
      setPurchasedCourses([]);
      setPurchasedCoursesError('');
      setPurchasedCoursesLoading(false);
      return;
    }

    void refreshPurchasedCourses(authState);
  }, [authState, refreshPurchasedCourses]);

  const value = useMemo(() => ({
    accessToken: authState.accessToken,
    user: authState.user,
    isAuthenticated: Boolean(authState.accessToken && authState.user?.id),
    purchasedCourses,
    purchasedCoursesLoading,
    purchasedCoursesError,
    syncAuthFromStorage,
    setSession,
    completeGoogleAuth,
    refreshPurchasedCourses,
    logout,
  }), [
    authState.accessToken,
    authState.user,
    purchasedCourses,
    purchasedCoursesLoading,
    purchasedCoursesError,
    syncAuthFromStorage,
    setSession,
    completeGoogleAuth,
    refreshPurchasedCourses,
    logout,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
