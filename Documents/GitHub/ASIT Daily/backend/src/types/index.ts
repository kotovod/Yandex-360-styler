export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
}

export interface TherapySession {
  id: string;
  user_id: string;
  start_date: string;
  maintenance_dose: number;
  reminder_time: string;
  created_at: Date;
}

export interface DoseRecord {
  id: string;
  therapy_session_id: string;
  date: string;
  taken: boolean;
  dose_count?: number;
  concentration?: string;
  notes?: string;
  created_at: Date;
}

export interface SideEffect {
  id: string;
  dose_record_id: string;
  date: string;
  type: string;
  severity: string;
  description?: string;
  created_at: Date;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  created_at: Date;
}
