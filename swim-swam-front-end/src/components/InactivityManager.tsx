import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authApi';
import { useInactivityStore } from '@/stores/useInactivityStore';

const INACTIVITY_INTERVAL_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = ['click', 'keydown', 'pointerdown', 'scroll', 'touchstart'];

const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

const InactivityManager: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const hasActivityRef = React.useRef(false);
  const {
    warningVisible,
    countdownSeconds,
    recordInactiveInterval,
    decrementCountdown,
    resetInactivity,
  } = useInactivityStore();

  React.useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const user = await authApi.getCurrentUser();
        if (isMounted) setIsLoggedIn(user !== null);
      } catch {
        if (isMounted) setIsLoggedIn(false);
      }
    };

    void checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const isLoggedInRef = React.useRef(isLoggedIn);
  React.useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  React.useEffect(() => {
    const handlePageHide = () => {
      if (isLoggedInRef.current) authApi.signOutOnUnload();
    };

    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, []);

  React.useEffect(() => {
    if (!isLoggedIn) {
      resetInactivity();
      return;
    }

    const markActivity = () => {
      hasActivityRef.current = true;
    };

    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, markActivity));
    const inactivityTimer = window.setInterval(() => {
      if (hasActivityRef.current) {
        hasActivityRef.current = false;
        return;
      }
      recordInactiveInterval();
    }, INACTIVITY_INTERVAL_MS);

    return () => {
      window.clearInterval(inactivityTimer);
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, markActivity));
    };
  }, [isLoggedIn, recordInactiveInterval, resetInactivity]);

  React.useEffect(() => {
    if (!warningVisible) return;

    const countdownTimer = window.setInterval(() => {
      decrementCountdown();
    }, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [warningVisible, decrementCountdown]);

  React.useEffect(() => {
    if (!warningVisible || countdownSeconds > 0 || isSigningOut) return;

    setIsSigningOut(true);
    void authApi.signOut()
      .catch(() => undefined)
      .finally(() => {
        resetInactivity();
        setIsLoggedIn(false);
        setIsSigningOut(false);
        navigate('/sign-in');
      });
  }, [countdownSeconds, isSigningOut, navigate, resetInactivity, warningVisible]);

  const handleWarningConfirmation = () => {
    hasActivityRef.current = true;
    resetInactivity();
  };

  if (!isLoggedIn || !warningVisible) return null;

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4'>
      <div className='w-full max-w-sm rounded-lg bg-white p-6 text-center text-slate-900 shadow-xl'>
        <p>
          You will be disconnected in 4 minutes unless you confirm you are still here.
        </p>
        <p className='mt-3 text-2xl font-semibold'>{formatCountdown(countdownSeconds)}</p>
        <button
          type='button'
          className='mt-5 cursor-pointer rounded-lg bg-blue-500 px-5 py-2 text-white transition-colors hover:bg-blue-600'
          onClick={handleWarningConfirmation}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default InactivityManager;
