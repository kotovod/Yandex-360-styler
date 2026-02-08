import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; code?: string; suggestion?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const token = storage.get<string>('auth_token');
    const storedUser = storage.get<User>('user');
    
    if (token && storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      
      if (response.error) {
        const errorData = response.data as any;
        return { 
          success: false, 
          error: response.error,
          code: errorData?.code
        };
      }

      const authData = response.data as AuthResponse;
      storage.set('auth_token', authData.token);
      storage.set('user', authData.user);
      setUser(authData.user);
      
      console.log('✅ Вход успешен, токен сохранен');
      console.log('🔑 Токен:', localStorage.getItem('asit_auth_token'));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Ошибка при входе' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await api.register(email, password, name);
      
      if (response.error) {
        // Проверяем, есть ли дополнительная информация об ошибке
        const errorData = response.data as any;
        return { 
          success: false, 
          error: response.error,
          code: errorData?.code,
          suggestion: errorData?.suggestion
        };
      }

      const authData = response.data as AuthResponse;
      
      // НЕ устанавливаем пользователя сразу - нужно подтверждение email
      // Но сохраняем токен для последующего использования
      console.log('✅ Регистрация успешна, ожидается подтверждение email');
      console.log('📧 Код отправлен на:', email);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Ошибка при регистрации' };
    }
  };

  const logout = () => {
    storage.remove('auth_token');
    storage.remove('user');
    storage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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
