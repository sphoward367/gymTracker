import { useState, useEffect } from 'react';

export function useOnlineStatus(): boolean {
  // Initialise from navigator.onLine but also re-read inside the effect to
  // close the race window between the useState call and the listener registration.
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    // Re-read immediately in case the status changed before the listeners
    // were attached.
    setIsOnline(navigator.onLine);

    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
