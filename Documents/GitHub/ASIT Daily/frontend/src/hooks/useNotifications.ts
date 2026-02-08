import { useState, useEffect } from 'react';

interface NotificationState {
  permission: NotificationPermission;
  supported: boolean;
  subscribed: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    supported: false,
    subscribed: false,
  });

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    
    if (supported) {
      setState((prev) => ({
        ...prev,
        permission: Notification.permission,
        supported: true,
      }));
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!state.supported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    if (!state.supported || state.permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        // Note: You'll need to generate VAPID keys for production
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        
        if (vapidPublicKey) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });
        }
      }

      if (subscription) {
        setState((prev) => ({ ...prev, subscribed: true }));
      }

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setState((prev) => ({ ...prev, subscribed: false }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
    if (state.permission !== 'granted') {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  return {
    ...state,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
