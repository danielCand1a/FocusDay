import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, saveToken, clearToken, getToken } from '@/services/api';

type User = { id: string; name: string; email: string };

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthResponse = { token: string; user: User };

const USER_KEY = 'focusday_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getToken();
        if (!token) return;

        // Check token expiry from JWT payload (no network call needed)
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          await clearToken();
          return;
        }

        const stored = await SecureStore.getItemAsync(USER_KEY);
        if (stored) setUser(JSON.parse(stored));
      } catch {
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email: string, password: string) {
    const { token, user: userData } = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    await saveToken(token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  async function loginWithGoogle(idToken: string) {
    const { token, user: userData } = await api.post<AuthResponse>('/api/auth/google', { idToken });
    await saveToken(token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  async function register(email: string, password: string, name?: string) {
    const { token, user: userData } = await api.post<AuthResponse>('/api/auth/register', {
      email,
      password,
      name,
    });
    await saveToken(token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }

  async function logout() {
    await clearToken();
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
