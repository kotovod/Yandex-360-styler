import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types';
import * as api from '@/services/api';
import * as storage from '@/services/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user and token from storage on mount
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response: AuthResponse = await api.login(data);
      
      storage.saveToken(response.token);
      storage.saveUser(response.user);
      
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response: AuthResponse = await api.register(data);
      
      storage.saveToken(response.token);
      storage.saveUser(response.user);
      
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    storage.clearAll();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
