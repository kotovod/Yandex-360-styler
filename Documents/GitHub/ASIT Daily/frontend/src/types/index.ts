// Type definitions for the app

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface TherapySession {
  id: string;
  userId: string;
  startDate: string;
  currentPhase: 'initial' | 'transition' | 'maintenance';
  maintenanceDose: number; // 4-8 clicks
  reminderTime: string; // HH:MM format
  active: boolean;
}

export interface DoseInfo {
  concentration: '10 ИР/мл' | '300 ИР/мл';
  clicks: number;
  phase: 'initial' | 'transition' | 'maintenance';
  color: 'blue' | 'purple';
  dayOfTherapy: number;
}

export interface Dose {
  id: string;
  therapySessionId: string;
  date: string;
  taken: boolean;
  doseCount: number;
  concentration: string;
  notes?: string;
  timestamp?: string;
}

export interface SideEffect {
  id: string;
  doseId?: string;
  date: string;
  type: 'itching' | 'swelling' | 'redness' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
