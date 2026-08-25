import Hamburger from '@/components/ui/hamburger';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { generalInfoApi, type LiveCompetitionListItem } from '@/services/generalInfoApi';
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

  // Placeholder for future auth wiring. For now all users are treated as logged out.
  const isLoggedIn = false;

  React.useEffect(() => {
    if (isLoggedIn) {
      return;
    }

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
  }, [isLoggedIn]);

  const openCompetitions = liveCompetitions.filter((competition) => competition.status === 'open');
  const upcomingCompetitions = liveCompetitions.filter((competition) => competition.status === 'upcoming');

  return (
    <div className='relative min-h-screen w-full bg-slate-950 text-white'>
      <div className='absolute top-6 right-6'>
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <Hamburger />
            </div>
          </PopoverTrigger>
          <PopoverContent align='end' className='w-56 bg-slate-900 border-slate-700 p-2'>
            <div className='flex flex-col gap-1'>
              <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer'>
                Search competition
              </Button>
              <Button type='button' variant='ghost' className='justify-start text-white hover:bg-slate-800 cursor-pointer'>
                User settings
              </Button>
              <Button
                type='button'
                variant='ghost'
                className='justify-start text-white hover:bg-slate-800 cursor-pointer'
                onClick={() => navigate('/adminPage')}
              >
                Admin seetings
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
