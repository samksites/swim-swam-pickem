import { Button } from '@/components/ui/button';
import HamburgerMenu from '@/components/ui/hamburgerMenu';
import { useNavigate } from 'react-router-dom';
import { generalInfoApi, type LiveCompetitionListItem } from '@/services/generalInfoApi';
import { authApi, type AuthUser } from '@/services/authApi';
import ActivityTracker from '@/components/ActivityTracker';
import React from 'react';

const formatDateLabel = (value?: string): string => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const month = parsed.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const day = parsed.getUTCDate();
  const daySuffix = (() => {
    if (day % 100 >= 11 && day % 100 <= 13) return 'th';
    if (day % 10 === 1) return 'st';
    if (day % 10 === 2) return 'nd';
    if (day % 10 === 3) return 'rd';
    return 'th';
  })();

  return `${month} ${day}${daySuffix}`;
};

const CompetitionListSection: React.FC<{
  title: string;
  emptyMessage: string;
  competitions: LiveCompetitionListItem[];
  valueLabel: string;
  valueAccessor: (competition: LiveCompetitionListItem) => string | undefined;
}> = ({ title, emptyMessage, competitions, valueLabel, valueAccessor }) => {
  return (
    <div className='mb-12'>
      <h2 className='text-2xl font-semibold mb-4 text-center'>{title}</h2>

      {competitions.length === 0 ? (
        <p className='text-slate-300 text-center'>{emptyMessage}</p>
      ) : (
        <div className='flex flex-col gap-2'>
          {competitions.map((competition) => (
            <div
              key={competition.comp_id}
              className='rounded-md border border-slate-700 bg-slate-900 px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 ease-out hover:scale-[1.01] hover:border-slate-200/80 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]'
            >
              <div className='font-medium text-white'>{competition.title}</div>
              <div className='text-sm text-slate-300'>
                {valueLabel} {formatDateLabel(valueAccessor(competition))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [liveCompetitions, setLiveCompetitions] = React.useState<LiveCompetitionListItem[]>([]);
  const [loadError, setLoadError] = React.useState<string>('');
  const [currentUser, setCurrentUser] = React.useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const run = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    void run();
  }, []);

  React.useEffect(() => {
    const run = async () => {
      try {
        const comps = await generalInfoApi.getLiveCompetitions();
        setLiveCompetitions(comps);
        setLoadError('');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load live competitions';
        setLoadError(message);
        setLiveCompetitions([]);
      }
    };

    void run();
  }, []);

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      setCurrentUser(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      setLoadError(message);
    }
  };

  const openCompetitions = liveCompetitions.filter((competition) => competition.status === 'open');
  const upcomingCompetitions = liveCompetitions.filter((competition) => competition.status === 'upcoming');

  return (
    <div className='relative min-h-screen w-full bg-slate-950 text-white'>
      <ActivityTracker onSessionExpired={() => setCurrentUser(null)} />
      <HamburgerMenu>
        {isAuthLoading ? null : currentUser ? (
          <>
            <div className='px-3 py-2 text-sm text-slate-300 truncate'>{currentUser.email}</div>
            <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer' onClick={() => void handleSignOut()}>
              Sign out
            </Button>
          </>
        ) : (
          <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer' onClick={() => navigate('/sign-in')}>
            Sign in
          </Button>
        )}
        <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer'>
          Search competition
        </Button>
        <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer'>
          User settings
        </Button>
        {currentUser?.isAdmin ? (
          <Button
            type='button'
            variant='ghost'
            className='justify-start text-white hover:bg-slate-800 cursor-pointer'
            onClick={() => navigate('/adminPage')}
          >
            Admin seetings
          </Button>
        ) : null}
      </HamburgerMenu>

      <div className='w-full pt-8 text-center px-6'>
        <h1 className='text-4xl font-semibold'>Swim Swam Pickem</h1>
      </div>

      <div className='mt-16 px-6 max-w-2xl mx-auto'>
        {loadError ? <p className='text-red-300 mb-8'>{loadError}</p> : null}

        <CompetitionListSection
          title='Open competitions'
          emptyMessage='No open competitions right now.'
          competitions={openCompetitions}
          valueLabel='Entries close:'
          valueAccessor={(competition) => competition.starts_on}
        />

        <CompetitionListSection
          title='Up coming competitions'
          emptyMessage='No upcoming competitions right now.'
          competitions={upcomingCompetitions}
          valueLabel='Starts:'
          valueAccessor={(competition) => competition.starts_on}
        />
      </div>
    </div>
  );
};

export default HomePage;
