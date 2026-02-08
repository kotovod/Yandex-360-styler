import { DoseInfo } from '../types';

export function getDaysSince(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 because day 1 is the start date
}

export function getCurrentDose(startDate: string, maintenanceDose: number = 3): DoseInfo {
  const dayOfTherapy = getDaysSince(startDate);
  
  // Начальная терапия: День 1-5 (10 ИР/мл, голубая крышка)
  if (dayOfTherapy <= 5) {
    return {
      concentration: '10 ИР/мл',
      clicks: dayOfTherapy,
      phase: 'initial',
      color: 'blue',
      dayOfTherapy,
    };
  } 
  // Переход: День 6-9 (300 ИР/мл, фиолетовая крышка)
  else if (dayOfTherapy <= 9) {
    return {
      concentration: '300 ИР/мл',
      clicks: dayOfTherapy - 5,
      phase: 'transition',
      color: 'purple',
      dayOfTherapy,
    };
  } 
  // Поддерживающая терапия: День 10+ (300 ИР/мл)
  else {
    return {
      concentration: '300 ИР/мл',
      clicks: maintenanceDose,
      phase: 'maintenance',
      color: 'purple',
      dayOfTherapy,
    };
  }
}

export function getPhaseProgress(phase: string, dayOfTherapy: number): number {
  if (phase === 'initial') {
    return (dayOfTherapy / 5) * 100;
  } else if (phase === 'transition') {
    return ((dayOfTherapy - 5) / 4) * 100;
  }
  return 100;
}

export function getPhaseLabel(phase: string): string {
  switch (phase) {
    case 'initial':
      return 'Начальная фаза';
    case 'transition':
      return 'Фаза перехода';
    case 'maintenance':
      return 'Поддерживающая терапия';
    default:
      return '';
  }
}
