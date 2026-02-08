const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Import storage to use the same method
import { storage } from './storage';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = storage.get<string>('auth_token');
  
  console.log('🔑 API Request:', endpoint, 'Token:', token ? 'Есть' : 'Нет');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      return { error: errorData.error || `HTTP ${response.status}`, data: errorData };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Ошибка сети. Проверьте подключение к интернету.' };
  }
}

export const api = {
  // Auth
  register: (email: string, password: string, name: string) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email: string, code: string) =>
    fetchApi('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  resendVerification: (email: string) =>
    fetchApi('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    fetchApi('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),

  // Therapy
  getCurrentTherapy: () => fetchApi('/therapy/current'),

  startTherapy: (startDate: string, maintenanceDose: number, reminderTime: string) =>
    fetchApi('/therapy/start', {
      method: 'POST',
      body: JSON.stringify({ startDate, maintenanceDose, reminderTime }),
    }),

  takeDose: (date: string, doseCount: number, concentration: string, notes?: string) =>
    fetchApi('/therapy/take-dose', {
      method: 'POST',
      body: JSON.stringify({ date, doseCount, concentration, notes }),
    }),

  skipDose: (date: string, reason?: string) =>
    fetchApi('/therapy/skip-dose', {
      method: 'PUT',
      body: JSON.stringify({ date, reason }),
    }),

  getHistory: (limit?: number) =>
    fetchApi(`/therapy/history${limit ? `?limit=${limit}` : ''}`),

  // Side Effects
  addSideEffect: (doseRecordId: string, type: string, severity: string, description: string) =>
    fetchApi('/therapy/side-effect', {
      method: 'POST',
      body: JSON.stringify({ doseRecordId, type, severity, description }),
    }),

  // Notifications
  subscribePush: (subscription: PushSubscription) =>
    fetchApi('/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    }),

  // Export
  exportPdf: () => fetch(`${API_BASE_URL}/export/pdf`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
  }),
};
