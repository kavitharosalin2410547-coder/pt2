/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import { setAccessToken } from '../services/apiClient';
import type { AuthUser, LoginRequest, SignupRequest } from '../types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (input: LoginRequest) => Promise<void>;
  signup: (input: SignupRequest) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  login: async () => undefined,
  signup: async () => undefined,
  logout: () => undefined,
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem('accessToken');

    if (!token) {
      setIsInitializing(false);
      return;
    }

    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => setAccessToken(null))
      .finally(() => setIsInitializing(false));
  }, []);

  const login = useCallback(async (input: LoginRequest) => {
    const result = await authService.login(input);
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const signup = useCallback(async (input: SignupRequest) => {
    const result = await authService.signup(input);
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      signup,
      logout,
    }),
    [isInitializing, login, logout, signup, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
