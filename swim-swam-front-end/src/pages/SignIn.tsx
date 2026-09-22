import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authApi';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: { theme: string; size: string; width: number }) => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() ?? '';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState('');
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  React.useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          setIsSigningIn(true);
          setError('');
          void authApi.signInWithGoogle(response.credential)
            .then(() => navigate('/'))
            .catch((signInError: unknown) => {
              setError(signInError instanceof Error ? signInError.message : 'Google sign-in failed');
              setIsSigningIn(false);
            });
        },
      });
      buttonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 280,
      });
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
  }, [navigate]);

  return (
    <main className='min-h-screen bg-slate-950 text-white flex items-center justify-center px-6'>
      <section className='w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-8 text-center shadow-xl'>
        <h1 className='text-3xl font-semibold'>Sign in</h1>
        <p className='mt-3 text-slate-300'>Use your Google account to save your picks and access your account.</p>

        {!GOOGLE_CLIENT_ID ? (
          <p className='mt-6 text-red-300'>Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to the frontend environment.</p>
        ) : (
          <div className='mt-7 flex min-h-10 justify-center' ref={buttonRef} aria-busy={isSigningIn} />
        )}

        {error ? <p className='mt-5 text-red-300'>{error}</p> : null}

        <button
          type='button'
          className='mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700'
          onClick={() => navigate('/sign-in/password')}
        >
          Sign in with username and password
        </button>

        <p className='mt-6 text-slate-300'>
          Don&apos;t have an account?{' '}
          <button
            type='button'
            className='cursor-pointer font-medium text-sky-400 underline underline-offset-4'
            onClick={() => navigate('/sign-up')}
          >
            Sign up
          </button>
        </p>

        <Button type='button' variant='ghost' className='mt-6 cursor-pointer text-slate-300' onClick={() => navigate('/')}>
          Back to home
        </Button>
      </section>
    </main>
  );
};

export default SignIn;
