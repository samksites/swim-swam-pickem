import { Button } from '@/components/ui/button';
import HamburgerMenu from '@/components/ui/hamburgerMenu';
import { useNavigate } from 'react-router-dom';
import { generalInfoApi, type EnteredCompetitionListItem, type LiveCompetitionListItem } from '@/services/generalInfoApi';
import { authApi, type AuthUser } from '@/services/authApi';
import ActivityTracker from '@/components/ActivityTracker';
import React from 'react';

type HomeCompetition = {
  comp_id: number;
  title: string;
  status: LiveCompetitionListItem['status'];
  starts_on?: string;
};

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
  competitions: HomeCompetition[];
  valueLabel: string;
  valueAccessor: (competition: HomeCompetition) => string | undefined;
  onSelect?: (competition: HomeCompetition) => void;
}> = ({ title, emptyMessage, competitions, valueLabel, valueAccessor, onSelect }) => {
  return (
    <div className='mb-12'>
      <h2 className='text-2xl font-semibold mb-4 text-center'>{title}</h2>

      {competitions.length === 0 ? (
        <p className='text-slate-300 text-center'>{emptyMessage}</p>
      ) : (
        <div className='flex flex-col gap-2'>
          {competitions.map((competition) => {
            const rowContent = (
              <>
                <div className='font-medium text-white'>{competition.title}</div>
                <div className='text-sm text-slate-300'>
                  {valueLabel} {formatDateLabel(valueAccessor(competition))}
                </div>
              </>
            );
            const rowClassName = 'w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 flex items-center justify-between gap-3 text-left transition-all duration-200 ease-out';

            return onSelect ? (
              <button
                key={competition.comp_id}
                type='button'
                onClick={() => onSelect(competition)}
                className={`${rowClassName} cursor-pointer hover:scale-[1.01] hover:border-slate-200/80 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]`}
              >
                {rowContent}
              </button>
            ) : (
              <div key={competition.comp_id} className={rowClassName}>
                {rowContent}
              </div>
            );
          })}
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
  const [enteredCompetitions, setEnteredCompetitions] = React.useState<EnteredCompetitionListItem[]>([]);
  const [enteredCompetitionsError, setEnteredCompetitionsError] = React.useState('');
  const [isEnteredCompetitionsLoading, setIsEnteredCompetitionsLoading] = React.useState(false);
  const publicUserId = currentUser?.publicUserId;

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
    if (!publicUserId) {
      setEnteredCompetitions([]);
      setEnteredCompetitionsError('');
      setIsEnteredCompetitionsLoading(false);
      return;
    }

    let isCurrentRequest = true;
    setIsEnteredCompetitionsLoading(true);
    void generalInfoApi.getEnteredCompetitions(publicUserId)
      .then((competitions) => {
        if (!isCurrentRequest) return;
        setEnteredCompetitions(competitions);
        setEnteredCompetitionsError('');
      })
      .catch((error) => {
        if (!isCurrentRequest) return;
        const message = error instanceof Error ? error.message : 'Failed to load your competitions';
        setEnteredCompetitionsError(message);
        setEnteredCompetitions([]);
      })
      .finally(() => {
        if (isCurrentRequest) setIsEnteredCompetitionsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [publicUserId]);

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
  const enteredUpcomingCompetitions = enteredCompetitions.filter((competition) => competition.status === 'upcoming' || competition.status === 'open');
  const enteredCurrentCompetitions = enteredCompetitions.filter((competition) => competition.status === 'current');
  const enteredCompetitionsEmptyMessage = isEnteredCompetitionsLoading
    ? 'Loading your competitions...'
    : enteredCompetitionsError || 'No entered competitions in this category.';

  return (
    <div className='relative min-h-screen w-full bg-slate-950 text-white'>
      <ActivityTracker onSessionExpired={() => setCurrentUser(null)} />
      <HamburgerMenu>
        {isAuthLoading ? null : currentUser ? (
          <>
            <div className='px-3 py-2 text-sm text-slate-300 truncate'>{currentUser.email}</div>
          </>
        ) : (
          <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer' onClick={() => navigate('/sign-in')}>
            Sign in
          </Button>
        )}
        <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer'>
          Search competition
        </Button>
        {currentUser ? (
          <Button
            type='button'
            variant='ghost'
            className='justify-start text-white hover:bg-slate-800 cursor-pointer'
            onClick={() => navigate('/user-settings')}
          >
            User settings
          </Button>
        ) : null}
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
        {currentUser ? (
          <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer' onClick={() => void handleSignOut()}>
            Sign out
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
          onSelect={(competition) => navigate(`/enterCompetition/${competition.comp_id}`)}
        />

        <CompetitionListSection
          title='Up coming competitions'
          emptyMessage='No upcoming competitions right now.'
          competitions={upcomingCompetitions}
          valueLabel='Starts:'
          valueAccessor={(competition) => competition.starts_on}
        />

        {currentUser ? (
          <>
            <CompetitionListSection
              title='Your upcoming competitions'
              emptyMessage={enteredCompetitionsEmptyMessage}
              competitions={enteredUpcomingCompetitions}
              valueLabel='Starts:'
              valueAccessor={(competition) => competition.starts_on}
              onSelect={(competition) => navigate(`/enterCompetition/${competition.comp_id}`)}
            />
            <CompetitionListSection
              title='Your current competitions'
              emptyMessage={enteredCompetitionsEmptyMessage}
              competitions={enteredCurrentCompetitions}
              valueLabel='Started:'
              valueAccessor={(competition) => competition.starts_on}
              onSelect={(competition) => navigate(`/enterCompetition/${competition.comp_id}`)}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default HomePage;
