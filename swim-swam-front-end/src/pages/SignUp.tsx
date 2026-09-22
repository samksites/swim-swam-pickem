import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSigningUp, setIsSigningUp] = React.useState(false);

  const handleSignUp = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setError('');
    setIsSigningUp(true);
    void authApi.signUp(username, email, password)
      .then(() => navigate('/'))
      .catch((signUpError: unknown) => {
        setError(signUpError instanceof Error ? signUpError.message : 'Sign up failed');
        setIsSigningUp(false);
      });
  };

  return (
    <main className='min-h-screen bg-slate-950 text-white flex items-center justify-center px-6'>
      <section className='w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-8 text-center shadow-xl'>
        <h1 className='text-3xl font-semibold'>Sign up</h1>
        <p className='mt-3 text-slate-300'>Create an account to save your picks.</p>

        <form className='mt-6 space-y-4 text-left' onSubmit={handleSignUp}>
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
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              value={email}
              onChange={(changeEvent) => setEmail(changeEvent.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              autoComplete='new-password'
              value={password}
              onChange={(changeEvent) => setPassword(changeEvent.target.value)}
            />
          </div>
          <Button type='submit' className='w-full cursor-pointer' disabled={isSigningUp}>
            Sign up
          </Button>
        </form>

        {error ? <p className='mt-5 text-red-300'>{error}</p> : null}

        <p className='mt-6 text-slate-300'>
          Already have an account?{' '}
          <button
            type='button'
            className='cursor-pointer font-medium text-white underline underline-offset-4'
            onClick={() => navigate('/sign-in')}
          >
            Sign in
          </button>
        </p>

        <Button type='button' variant='ghost' className='mt-6 text-slate-300' onClick={() => navigate('/')}>
          Back to home
        </Button>
      </section>
    </main>
  );
};

export default SignUp;
