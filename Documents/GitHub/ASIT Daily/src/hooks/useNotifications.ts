import { useState, useEffect } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const scheduleNotification = async (title: string, body: string, scheduledTime?: Date) => {
    if (permission !== 'granted') {
      return false;
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        if (scheduledTime) {
          // For scheduled notifications, we'll use the backend
          return true;
        } else {
          // Immediate notification
          registration.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            vibrate: [200, 100, 200],
            tag: 'asit-reminder',
            requireInteraction: false,
          });
          return true;
        }
      } catch (error) {
        console.error('Error scheduling notification:', error);
        return false;
      }
    }

    return false;
  };

  return {
    permission,
    isSupported,
    requestPermission,
    scheduleNotification,
  };
}
