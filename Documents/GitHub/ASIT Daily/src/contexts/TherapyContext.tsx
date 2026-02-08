import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TherapySession, DoseRecord } from '../types';
import { api } from '../services/api';
import { storage, cache } from '../services/storage';
import { useAuth } from './AuthContext';

interface TherapyContextType {
  therapySession: TherapySession | null;
  todayDose: DoseRecord | null;
  isLoading: boolean;
  startTherapy: (startDate: string, maintenanceDose: number, reminderTime: string) => Promise<boolean>;
  takeDose: (doseCount: number, concentration: string, notes?: string) => Promise<boolean>;
  skipDose: (reason?: string) => Promise<boolean>;
  refreshTherapy: () => Promise<void>;
}

const TherapyContext = createContext<TherapyContextType | undefined>(undefined);

export function TherapyProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [therapySession, setTherapySession] = useState<TherapySession | null>(null);
  const [todayDose, setTodayDose] = useState<DoseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTherapy = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getCurrentTherapy();
      
      if (response.data) {
        const data = response.data as any;
        setTherapySession(data.session);
        setTodayDose(data.todayDose);
        cache.setTherapyData(data);
      } else {
        // Try to load from cache
        const cachedData = cache.getTherapyData();
        if (cachedData) {
          setTherapySession(cachedData.session);
          setTodayDose(cachedData.todayDose);
        }
      }
    } catch (error) {
      console.error('Error loading therapy:', error);
      // Load from cache on error
      const cachedData = cache.getTherapyData();
      if (cachedData) {
        setTherapySession(cachedData.session);
        setTodayDose(cachedData.todayDose);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTherapy();
  }, [isAuthenticated]);

  const startTherapy = async (startDate: string, maintenanceDose: number, reminderTime: string) => {
    try {
      const response = await api.startTherapy(startDate, maintenanceDose, reminderTime);
      
      if (response.data) {
        await loadTherapy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting therapy:', error);
      return false;
    }
  };

  const takeDose = async (doseCount: number, concentration: string, notes?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.takeDose(today, doseCount, concentration, notes);
      
      if (response.data) {
        await loadTherapy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error taking dose:', error);
      return false;
    }
  };

  const skipDose = async (reason?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.skipDose(today, reason);
      
      if (response.data) {
        await loadTherapy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error skipping dose:', error);
      return false;
    }
  };

  const refreshTherapy = async () => {
    setIsLoading(true);
    await loadTherapy();
  };

  return (
    <TherapyContext.Provider
      value={{
        therapySession,
        todayDose,
        isLoading,
        startTherapy,
        takeDose,
        skipDose,
        refreshTherapy,
      }}
    >
      {children}
    </TherapyContext.Provider>
  );
}

export function useTherapy() {
  const context = useContext(TherapyContext);
  if (context === undefined) {
    throw new Error('useTherapy must be used within a TherapyProvider');
  }
  return context;
}
