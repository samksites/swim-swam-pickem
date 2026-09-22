import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignInWithPassword: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handlePasswordSignIn = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setError('');
    setIsSigningIn(true);
    void authApi.signInWithPassword(username, password)
      .then(() => navigate('/'))
      .catch((signInError: unknown) => {
        setError(signInError instanceof Error ? signInError.message : 'Sign in failed');
        setIsSigningIn(false);
      });
  };

  return (
    <main className='min-h-screen bg-slate-950 text-white flex items-center justify-center px-6'>
      <section className='w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-8 text-center shadow-xl'>
        <h1 className='text-3xl font-semibold'>Sign in with username and password</h1>

        <form className='mt-6 space-y-4 text-left' onSubmit={handlePasswordSignIn}>
          <div className='space-y-2'>
            <Label htmlFor='username'>Username</Label>
            <Input
              id='username'
              name='username'
              autoComplete='username'
              value={username}
              onChange={(changeEvent) => setUsername(changeEvent.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              autoComplete='current-password'
              value={password}
              onChange={(changeEvent) => setPassword(changeEvent.target.value)}
            />
          </div>
          <Button type='submit' className='w-full cursor-pointer' disabled={isSigningIn}>
            Sign in
          </Button>
        </form>

        {error ? <p className='mt-5 text-red-300'>{error}</p> : null}

        <Button
          type='button'
          variant='ghost'
          className='mt-6 cursor-pointer text-slate-300'
          onClick={() => navigate('/sign-in')}
        >
          Back to sign in
        </Button>
      </section>
    </main>
  );
};

export default SignInWithPassword;
