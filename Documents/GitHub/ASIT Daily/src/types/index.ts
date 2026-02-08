export interface DoseInfo {
  concentration: '10 ИР/мл' | '300 ИР/мл';
  clicks: number;
  phase: 'initial' | 'transition' | 'maintenance';
  color: 'blue' | 'purple';
  dayOfTherapy: number;
}

export interface TherapySession {
  id: string;
  userId: string;
  startDate: string;
  maintenanceDose: number;
  reminderTime: string;
  createdAt: string;
}

export interface DoseRecord {
  id: string;
  therapySessionId: string;
  date: string;
  taken: boolean;
  doseCount: number;
  concentration: string;
  notes?: string;
  createdAt: string;
}

export interface SideEffect {
  id: string;
  doseRecordId: string;
  date: string;
  type: 'itching' | 'swelling' | 'redness' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}
