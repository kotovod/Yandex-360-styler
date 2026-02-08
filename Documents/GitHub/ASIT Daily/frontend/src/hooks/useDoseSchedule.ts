import { useMemo } from 'react';
import type { DoseInfo } from '@/types';

/**
 * Calculate the current dose based on therapy start date
 * 
 * Phase 1 (Days 1-10): Initial therapy with 10 IR/ml (blue cap)
 *   - Increase from 1 to 10 clicks
 * 
 * Phase 2 (Days 11-18): Transition with 300 IR/ml (purple cap)
 *   - Increase from 1 to 8 clicks
 * 
 * Phase 3 (Day 19+): Maintenance with 300 IR/ml (purple cap)
 *   - Constant dose (4-8 clicks, user configured)
 */

export function useDoseSchedule(
  startDate: string | null,
  maintenanceDose: number = 6
): DoseInfo | null {
  return useMemo(() => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - start.getTime();
    const dayOfTherapy = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (dayOfTherapy < 1) {
      return null;
    }

    // Phase 1: Initial therapy (10 IR/ml)
    if (dayOfTherapy <= 10) {
      return {
        concentration: '10 ИР/мл',
        clicks: dayOfTherapy,
        phase: 'initial',
        color: 'blue',
        dayOfTherapy,
      };
    }

    // Phase 2: Transition (300 IR/ml)
    if (dayOfTherapy <= 18) {
      return {
        concentration: '300 ИР/мл',
        clicks: dayOfTherapy - 10,
        phase: 'transition',
        color: 'purple',
        dayOfTherapy,
      };
    }

    // Phase 3: Maintenance (300 IR/ml)
    return {
      concentration: '300 ИР/мл',
      clicks: maintenanceDose,
      phase: 'maintenance',
      color: 'purple',
      dayOfTherapy,
    };
  }, [startDate, maintenanceDose]);
}

export function getPhaseProgress(dayOfTherapy: number): {
  phase: string;
  current: number;
  total: number;
  percentage: number;
} {
  if (dayOfTherapy <= 10) {
    return {
      phase: 'Начальная фаза',
      current: dayOfTherapy,
      total: 10,
      percentage: (dayOfTherapy / 10) * 100,
    };
  }

  if (dayOfTherapy <= 18) {
    return {
      phase: 'Фаза перехода',
      current: dayOfTherapy - 10,
      total: 8,
      percentage: ((dayOfTherapy - 10) / 8) * 100,
    };
  }

  return {
    phase: 'Поддерживающая терапия',
    current: dayOfTherapy - 18,
    total: 0,
    percentage: 100,
  };
}

export function getPhaseName(phase: 'initial' | 'transition' | 'maintenance'): string {
  const names = {
    initial: 'Начальная фаза',
    transition: 'Фаза перехода',
    maintenance: 'Поддерживающая терапия',
  };
  return names[phase];
}

export function getConcentrationColor(concentration: '10 ИР/мл' | '300 ИР/мл'): string {
  return concentration === '10 ИР/мл' ? 'blue' : 'purple';
}
