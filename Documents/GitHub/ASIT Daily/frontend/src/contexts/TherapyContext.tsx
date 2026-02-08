import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { TherapySession, Dose, SideEffect, DoseInfo } from '@/types';
import * as api from '@/services/api';
import * as storage from '@/services/storage';
import { useDoseSchedule } from '@/hooks/useDoseSchedule';

interface TherapyContextType {
  therapy: TherapySession | null;
  currentDose: DoseInfo | null;
  doses: Dose[];
  sideEffects: SideEffect[];
  loading: boolean;
  startTherapy: (startDate: string, reminderTime: string) => Promise<void>;
  takeDose: (notes?: string) => Promise<void>;
  skipDose: () => Promise<void>;
  addSideEffect: (sideEffect: Omit<SideEffect, 'id'>) => Promise<void>;
  updateMaintenanceDose: (doseCount: number) => Promise<void>;
  refreshTherapy: () => Promise<void>;
}

const TherapyContext = createContext<TherapyContextType | undefined>(undefined);

export function TherapyProvider({ children }: { children: ReactNode }) {
  const [therapy, setTherapy] = useState<TherapySession | null>(null);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [sideEffects, setSideEffects] = useState<SideEffect[]>([]);
  const [loading, setLoading] = useState(true);

  const currentDose = useDoseSchedule(
    therapy?.startDate || null,
    therapy?.maintenanceDose || 6
  );

  useEffect(() => {
    // Load from storage on mount
    const storedTherapy = storage.getTherapy();
    const storedDoses = storage.getDoses();
    const storedSideEffects = storage.getSideEffects();

    if (storedTherapy) {
      setTherapy(storedTherapy);
    }
    setDoses(storedDoses);
    setSideEffects(storedSideEffects);

    setLoading(false);

    // Try to fetch from API
    refreshTherapy();
  }, []);

  const refreshTherapy = async () => {
    try {
      const [therapyData, dosesData, sideEffectsData] = await Promise.all([
        api.getCurrentTherapy(),
        api.getDoseHistory(),
        api.getSideEffects(),
      ]);

      setTherapy(therapyData);
      setDoses(dosesData);
      setSideEffects(sideEffectsData);

      storage.saveTherapy(therapyData);
      storage.saveDoses(dosesData);
      storage.saveSideEffects(sideEffectsData);
      storage.saveLastSync();
    } catch (error) {
      console.error('Error refreshing therapy:', error);
      // Continue with cached data
    }
  };

  const startTherapy = async (startDate: string, reminderTime: string) => {
    try {
      const newTherapy = await api.startTherapy(startDate, reminderTime);
      setTherapy(newTherapy);
      storage.saveTherapy(newTherapy);
    } catch (error) {
      console.error('Error starting therapy:', error);
      throw error;
    }
  };

  const takeDose = async (notes?: string) => {
    try {
      const newDose = await api.takeDose(notes);
      setDoses((prev) => [newDose, ...prev]);
      storage.addDose(newDose);
    } catch (error) {
      console.error('Error taking dose:', error);
      throw error;
    }
  };

  const skipDose = async () => {
    try {
      const skippedDose = await api.skipDose();
      setDoses((prev) => [skippedDose, ...prev]);
      storage.addDose(skippedDose);
    } catch (error) {
      console.error('Error skipping dose:', error);
      throw error;
    }
  };

  const addSideEffect = async (sideEffect: Omit<SideEffect, 'id'>) => {
    try {
      const newSideEffect = await api.addSideEffect(sideEffect);
      setSideEffects((prev) => [newSideEffect, ...prev]);
      storage.addSideEffect(newSideEffect);
    } catch (error) {
      console.error('Error adding side effect:', error);
      throw error;
    }
  };

  const updateMaintenanceDose = async (doseCount: number) => {
    try {
      const updatedTherapy = await api.updateMaintenanceDose(doseCount);
      setTherapy(updatedTherapy);
      storage.saveTherapy(updatedTherapy);
    } catch (error) {
      console.error('Error updating maintenance dose:', error);
      throw error;
    }
  };

  return (
    <TherapyContext.Provider
      value={{
        therapy,
        currentDose,
        doses,
        sideEffects,
        loading,
        startTherapy,
        takeDose,
        skipDose,
        addSideEffect,
        updateMaintenanceDose,
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
