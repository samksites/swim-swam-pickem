import React from 'react';
import { authApi } from '@/services/authApi';

type ActivityTrackerProps = {
  onSessionExpired?: () => void;
};

const ACTIVITY_INTERVAL_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ['click', 'keydown', 'pointerdown', 'scroll', 'touchstart'];

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ onSessionExpired }) => {
  const onSessionExpiredRef = React.useRef(onSessionExpired);

  React.useEffect(() => {
    onSessionExpiredRef.current = onSessionExpired;
  }, [onSessionExpired]);

  React.useEffect(() => {
    let isMounted = true;
    let isLoggedIn = false;
    let hasActivity = false;

    const markActivity = () => {
      hasActivity = true;
    };

    const activityTimer = window.setInterval(() => {
      if (!isLoggedIn || !hasActivity) return;

      hasActivity = false;
      void authApi.updateActivity().catch(() => {
        if (isMounted) onSessionExpiredRef.current?.();
      });
    }, ACTIVITY_INTERVAL_MS);

    const checkSession = async () => {
      try {
        isLoggedIn = (await authApi.getCurrentUser()) !== null;
      } catch {
        isLoggedIn = false;
      }

      if (!isLoggedIn) return;
      ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, markActivity));
    };

    void checkSession();

    return () => {
      isMounted = false;
      window.clearInterval(activityTimer);
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, markActivity));
    };
  }, []);

  return null;
};

export default ActivityTracker;
