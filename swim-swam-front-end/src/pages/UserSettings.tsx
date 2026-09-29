import React from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityTracker from '@/components/ActivityTracker';
import HamburgerMenu from '@/components/ui/hamburgerMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi, type AuthUser } from '@/services/authApi';
import { Pencil, X } from 'lucide-react';

const formatJoinedDate = (value: string): string => new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(value));

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');
  const [usernameInput, setUsernameInput] = React.useState('');
  const [usernameError, setUsernameError] = React.useState('');
  const [usernameSuccess, setUsernameSuccess] = React.useState('');
  const [isSavingUsername, setIsSavingUsername] = React.useState(false);
  const [isEditingUsername, setIsEditingUsername] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      try {
        const user = await authApi.getCurrentUser();
        if (!user) {
          navigate('/');
          return;
        }

        setCurrentUser(user);
        setUsernameInput(user.username);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load user settings';
        setLoadError(message);
      } finally {
        setIsAuthLoading(false);
      }
    };

    void run();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      navigate('/sign-in');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      setLoadError(message);
    }
  };

  const handleUpdateUsername = async () => {
    const trimmed = usernameInput.trim();
    if (!trimmed || trimmed === currentUser?.username) return;

    setUsernameError('');
    setUsernameSuccess('');
    setIsSavingUsername(true);
    try {
      const updatedUser = await authApi.updateUsername(trimmed);
      setCurrentUser(updatedUser);
      setUsernameInput(updatedUser.username);
      setUsernameSuccess('Username updated successfully.');
      setIsEditingUsername(false);
    } catch (error) {
      setUsernameError(error instanceof Error ? error.message : 'Failed to update username');
    } finally {
      setIsSavingUsername(false);
    }
  };

  return (
    <div className='relative min-h-screen w-full bg-slate-950 text-white'>
      <ActivityTracker onSessionExpired={() => setCurrentUser(null)} />
      <HamburgerMenu>
        <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer' onClick={() => navigate('/')}>
          Home
        </Button>
        {currentUser ? (
          <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer' onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        ) : null}
      </HamburgerMenu>

      <div className='w-full pt-8 text-center px-6'>
        <h1 className='text-4xl font-semibold'>User settings Page</h1>
      </div>

      <div className='mt-12 px-6 max-w-2xl mx-auto'>
        {isAuthLoading ? <p className='text-slate-300 text-center'>Loading...</p> : null}
        {loadError ? <p className='text-red-300 text-center mb-6'>{loadError}</p> : null}

        {!isAuthLoading && !currentUser ? (
          <p className='text-slate-300 text-center'>You must be signed in to view your settings.</p>
        ) : null}

        {currentUser ? (
          <>
            <div className='overflow-hidden rounded-md border border-slate-700 bg-slate-900'>
              <table className='w-full text-left'>
                <tbody>
                  <tr className='border-b border-slate-700'>
                    <th scope='row' className='w-1/3 px-4 py-4 font-medium text-slate-300'>Username</th>
                    <td className='px-4 py-4'>
                      {isEditingUsername ? (
                        <div className='flex flex-wrap items-center gap-2'>
                          <Input
                            className='max-w-xs text-white'
                            value={usernameInput}
                            onChange={(event) => setUsernameInput(event.target.value)}
                            autoFocus
                          />
                          <Button
                            type='button'
                            className='cursor-pointer'
                            disabled={isSavingUsername || !usernameInput.trim() || usernameInput.trim() === currentUser.username}
                            onClick={() => void handleUpdateUsername()}
                          >
                            {isSavingUsername ? 'Saving...' : 'Save'}
                          </Button>
                          <Button type='button' variant='ghost' className='cursor-pointer text-slate-300' onClick={() => {
                            setUsernameInput(currentUser.username);
                            setUsernameError('');
                            setIsEditingUsername(false);
                          }}>
                            <X aria-hidden='true' />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center justify-between gap-3'>
                          <span>{currentUser.username}</span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='cursor-pointer text-slate-300'
                            aria-label='Edit username'
                            title='Edit username'
                            onClick={() => setIsEditingUsername(true)}
                          >
                            <Pencil aria-hidden='true' />
                          </Button>
                        </div>
                      )}
                      {usernameError ? <p className='mt-2 text-sm text-red-300'>{usernameError}</p> : null}
                      {usernameSuccess ? <p className='mt-2 text-sm text-green-300'>{usernameSuccess}</p> : null}
                    </td>
                  </tr>
                  <tr className='border-b border-slate-700'>
                    <th scope='row' className='px-4 py-4 font-medium text-slate-300'>Email</th>
                    <td className='px-4 py-4'>{currentUser.email}</td>
                  </tr>
                  <tr>
                    <th scope='row' className='px-4 py-4 font-medium text-slate-300'>Joined</th>
                    <td className='px-4 py-4'>{formatJoinedDate(currentUser.createdOn)}</td>
                  </tr>
                  <tr className='border-t border-slate-700'>
                    <th scope='row' className='px-4 py-4 font-medium text-slate-300'>Total points</th>
                    <td className='px-4 py-4'>-</td>
                  </tr>
                  <tr className='border-t border-slate-700'>
                    <th scope='row' className='px-4 py-4 font-medium text-slate-300'>Ranking</th>
                    <td className='px-4 py-4'>-</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </>
        ) : null}
      </div>
    </div>
  );
};

export default UserSettings;
