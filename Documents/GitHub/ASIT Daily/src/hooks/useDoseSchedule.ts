import { useState, useEffect } from 'react';
import { DoseInfo } from '../types';
import { getCurrentDose } from '../utils/doseCalculator';

export function useDoseSchedule(startDate: string | null, maintenanceDose: number = 3) {
  const [doseInfo, setDoseInfo] = useState<DoseInfo | null>(null);

  useEffect(() => {
    if (!startDate) {
      setDoseInfo(null);
      return;
    }

    const info = getCurrentDose(startDate, maintenanceDose);
    setDoseInfo(info);
  }, [startDate, maintenanceDose]);

  return doseInfo;
}
