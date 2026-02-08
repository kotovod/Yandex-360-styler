import axios from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TherapySession,
  Dose,
  SideEffect,
  DoseInfo
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data.data!;
};

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
};

// Therapy
export const getCurrentTherapy = async (): Promise<TherapySession> => {
  const response = await api.get<ApiResponse<TherapySession>>('/therapy/current');
  return response.data.data!;
};

export const startTherapy = async (startDate: string, reminderTime: string): Promise<TherapySession> => {
  const response = await api.post<ApiResponse<TherapySession>>('/therapy/start', {
    startDate,
    reminderTime,
  });
  return response.data.data!;
};

export const getCurrentDose = async (): Promise<DoseInfo> => {
  const response = await api.get<ApiResponse<DoseInfo>>('/therapy/current-dose');
  return response.data.data!;
};

export const takeDose = async (notes?: string): Promise<Dose> => {
  const response = await api.post<ApiResponse<Dose>>('/therapy/take-dose', { notes });
  return response.data.data!;
};

export const skipDose = async (): Promise<Dose> => {
  const response = await api.put<ApiResponse<Dose>>('/therapy/skip-dose');
  return response.data.data!;
};

export const getDoseHistory = async (): Promise<Dose[]> => {
  const response = await api.get<ApiResponse<Dose[]>>('/therapy/history');
  return response.data.data!;
};

export const updateMaintenanceDose = async (doseCount: number): Promise<TherapySession> => {
  const response = await api.put<ApiResponse<TherapySession>>('/therapy/maintenance-dose', {
    doseCount,
  });
  return response.data.data!;
};

// Side Effects
export const addSideEffect = async (sideEffect: Omit<SideEffect, 'id'>): Promise<SideEffect> => {
  const response = await api.post<ApiResponse<SideEffect>>('/therapy/side-effect', sideEffect);
  return response.data.data!;
};

export const getSideEffects = async (): Promise<SideEffect[]> => {
  const response = await api.get<ApiResponse<SideEffect[]>>('/therapy/side-effects');
  return response.data.data!;
};

// Notifications
export const subscribeToPush = async (subscription: PushSubscription): Promise<void> => {
  await api.post('/notifications/subscribe', subscription);
};

export const unsubscribeFromPush = async (endpoint: string): Promise<void> => {
  await api.post('/notifications/unsubscribe', { endpoint });
};

// Export
export const exportToPDF = async (): Promise<Blob> => {
  const response = await api.get('/export/pdf', {
    responseType: 'blob',
  });
  return response.data;
};

export default api;
