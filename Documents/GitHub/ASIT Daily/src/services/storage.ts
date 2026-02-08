interface StorageData {
  [key: string]: any;
}

const STORAGE_PREFIX = 'asit_';

export const storage = {
  set: <T>(key: string, value: T): void => {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, serialized);
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  },

  clear: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  },
};

// Cache for offline support
export const cache = {
  setTherapyData: (data: any) => storage.set('therapy_cache', data),
  getTherapyData: () => storage.get('therapy_cache'),
  setHistoryData: (data: any) => storage.set('history_cache', data),
  getHistoryData: () => storage.get('history_cache'),
};
