import React, { useEffect }  from 'react';
import SwitchLabel from '@/components/Switch';
import Card from '@/components/Card';
import Line from '@/components/ui/line';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import PlusButton from '@/components/ui/plusButton';
import BlurBackground from '@/components/ui/blurBackground';
import { IoClose } from "react-icons/io5";
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/datePicker';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import AllEvents from '../components/ui/allEvents';
import { useMeetStore } from "../stores/useMeetStore";
import type { CreateCompetitionProps } from "../types/components";
import { useAlertStore } from '@/stores/useAlertStore';
import checkCompetitionForSubmit, { convertMeetData, validateCompetitionDates } from '../lib/utils';
import type { MeetData } from '@/types/meet';
import meetJson from "../data/templateMeet.json";
import { meetApi } from '@/services/meetApi';
import type { AdminUserListItem, CompetitionEditorResponse, CompetitionListItem } from '@/services/meetApi';
import events from '@/data/events.json';

const ADMIN_USER_ID = (import.meta.env.VITE_ADMIN_USER_ID as string | undefined)?.trim() ?? "";

const areAdminUserListsEqual = (a: AdminUserListItem[], b: AdminUserListItem[]): boolean => {
    if (a.length !== b.length) return false;

    for (let index = 0; index < a.length; index++) {
        const left = a[index];
        const right = b[index];
        if (left.user_id !== right.user_id || left.username !== right.username || left.admin !== right.admin) {
            return false;
        }
    }

    return true;
};

const ManageUsersView: React.FC = () => {
    const [searchText, setSearchText] = React.useState<string>('');
    const [users, setUsers] = React.useState<AdminUserListItem[]>([]);
    const [loadError, setLoadError] = React.useState<string>('');
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [totalPages, setTotalPages] = React.useState<number>(0);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchText]);

    React.useEffect(() => {
        const run = window.setTimeout(async () => {
            if (!ADMIN_USER_ID) {
                const missingIdMessage = 'Missing VITE_ADMIN_USER_ID. Set it in swim-swam-front-end/.env.local';
                setLoadError((prev) => (prev === missingIdMessage ? prev : missingIdMessage));
                setUsers((prev) => (prev.length === 0 ? prev : []));
                setTotalPages((prev) => (prev === 0 ? prev : 0));
                return;
            }

            setLoadError((prev) => (prev === '' ? prev : ''));

            try {
                const allUsers = await meetApi.searchUsersByName(searchText, ADMIN_USER_ID);
                const nextTotalPages = Math.max(1, Math.ceil(allUsers.length / PAGE_SIZE));
                const clampedPage = Math.max(1, Math.min(nextTotalPages, currentPage));
                const start = (clampedPage - 1) * PAGE_SIZE;
                const pageItems = allUsers.slice(start, start + PAGE_SIZE);

                setUsers((prev) => (areAdminUserListsEqual(prev, pageItems) ? prev : pageItems));
                setTotalPages((prev) => (prev === nextTotalPages ? prev : nextTotalPages));
                if (clampedPage !== currentPage) {
                    setCurrentPage(clampedPage);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load users';
                setLoadError((prev) => (prev === message ? prev : message));
                setUsers((prev) => (prev.length === 0 ? prev : []));
                setTotalPages((prev) => (prev === 0 ? prev : 0));
            }
        }, 250);

        return () => {
            window.clearTimeout(run);
        };
    }, [searchText, currentPage]);

    const handlePageChange = (nextPage: number) => {
        const clamped = Math.max(1, Math.min(totalPages, nextPage));
        setCurrentPage((prev) => (prev === clamped ? prev : clamped));
    };

    const userRows = users.map((user) => (
        <div
            key={user.user_id}
            className='bg-white rounded-lg px-3 py-2 w-full max-w-2xl mx-auto flex items-center justify-between gap-3 min-h-12'
            data-user-id={user.user_id}
        >
            <div className='text-gray-900 font-semibold min-w-0 truncate text-sm'>
                {user.username}
            </div>
            <div className='text-xs text-gray-700 whitespace-nowrap'>
                {user.admin ? 'Admin' : 'Regular user'}
            </div>
            <Button type='button' variant='secondary' className='bg-blue-500 hover:bg-blue-600 text-white h-8 px-3 text-xs'>
                Edit
            </Button>
        </div>
    ));

    return (
        <div className='flex flex-col w-full h-full min-h-[70vh]'>
            <div className='flex flex-row justify-center items-center w-full mt-12 mb-8'>
                <Input
                    className='w-1/2 text-white'
                    placeholder='Search for users'
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />
            </div>

            <div className='flex-1'>
                <ScrollArea className='w-full max-w-3xl mx-auto rounded-lg border-2 border-blue-900 h-[52vh] max-h-[calc(100vh-260px)] min-h-[260px] px-3 py-3'>
                    <div className='w-full flex flex-col gap-2'>
                        {userRows}
                    </div>
                </ScrollArea>
                {loadError ? <p className='text-center text-red-300 mt-2'>{loadError}</p> : null}
                {!loadError && userRows.length === 0 ? (
                    <p className='text-center text-gray-300 mt-2'>No users match your search.</p>
                ) : null}
            </div>

            {totalPages > 1 ? (
                <div className='mt-auto pt-3'>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    className='text-blue-400'
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handlePageChange(currentPage - 1);
                                    }}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            className='text-blue-400'
                                            href="#"
                                            isActive={pageNumber === currentPage}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handlePageChange(pageNumber);
                                            }}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    className='text-blue-400'
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handlePageChange(currentPage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}
        </div>
    );
};
const PAGE_SIZE = 10;
type CompetitionFilterStatus = 'incomplete' | 'upcoming' | 'open' | 'current' | 'completed';

const mapCompetitionStatusToCardNumber = (status: CompetitionFilterStatus): number => {
    if (status === 'incomplete') return -1;
    if (status === 'upcoming') return 0;
    if (status === 'open') return 1;
    if (status === 'current') return 1;
    return 2;
};

const formatDateLabel = (value?: string): string => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toISOString().slice(0, 10);
};

const mapCompetitionStatusToMeetStatus = (status: CompetitionFilterStatus): number => {
    if (status === 'incomplete') return -1;
    if (status === 'upcoming') return 0;
    if (status === 'open') return 1;
    if (status === 'current') return 2;
    return 3;
};

const getEventsCatalogKey = (gender: 'm' | 'w' | 'c', type: 'scy' | 'scm' | 'lcm'): keyof typeof events => {
    if (gender === 'w') return `womens${type}` as keyof typeof events;
    return `mens${type}` as keyof typeof events;
};

const buildAllEventsMap = (gender: 'm' | 'w' | 'c', type: 'scy' | 'scm' | 'lcm', days: CompetitionEditorResponse['days']): Map<string, boolean> => {
    const eventKey = getEventsCatalogKey(gender, type);
    const allEventsMap = new Map<string, boolean>(
        Object.keys(events[eventKey]).map((eventName) => [eventName, true])
    );

    for (const day of days) {
        for (const event of day.events) {
            if (allEventsMap.has(event.title)) {
                allEventsMap.set(event.title, false);
            }
        }
    }

    return allEventsMap;
};

const competitionToMeetData = (competition: CompetitionEditorResponse): MeetData => {
    const normalizedDays = competition.days.map((day) => ({
        ...day,
        events: day.events.map((event) => ({
            ...event,
            swimmers: event.swimmers.map((swimmer) => ({
                ...swimmer,
                time: swimmer.time ?? '',
            })),
        })),
    }));

    return {
        id: String(competition.id),
        title: competition.title,
        type: competition.type,
        status: mapCompetitionStatusToMeetStatus(competition.status),
        entriesCloseDate: competition.entriesCloseDate ?? '',
        startDate: competition.startDate ?? '',
        gender: competition.gender,
        daysTitle: normalizedDays.map((day) => day.title),
        days: normalizedDays,
        seedTimes: true,
        allEvents: buildAllEventsMap(competition.gender, competition.type, normalizedDays),
    };
};

const areCompetitionListsEqual = (a: CompetitionListItem[], b: CompetitionListItem[]): boolean => {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        const left = a[i];
        const right = b[i];
        if (
            left.comp_id !== right.comp_id ||
            left.title !== right.title ||
            left.status !== right.status ||
            left.starts_on !== right.starts_on ||
            left.entries_open !== right.entries_open
        ) {
            return false;
        }
    }

    return true;
};

const oneYearFromNowIsoDate = (): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 10);
};

const getValidDateOrDefault = (value: string | undefined): string => {
    const candidate = String(value ?? '').trim();
    if (!candidate) {
        return oneYearFromNowIsoDate();
    }

    const parsed = new Date(candidate);
    if (Number.isNaN(parsed.getTime())) {
        return oneYearFromNowIsoDate();
    }

    return candidate;
};

const parseOptionalDate = (value: string): Date | undefined => {
    const candidate = String(value ?? '').trim();
    if (!candidate) {
        return undefined;
    }

    const parsed = new Date(candidate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const toUtcDateOnly = (value: Date): Date => {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
};

const addDaysUtc = (value: Date, days: number): Date => {
    return new Date(value.getTime() + days * MS_IN_DAY);
};

const formatDateOnly = (value: Date): string => {
    return value.toISOString().slice(0, 10);
};

/**
 * Component to create and edit competitions
 * @returns primary content of the page
 */
const CreateAndEditCompetition: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState<number>(0);

    // This function is used to change the active tab when a tab is clicked
    // It updates the state with the index of the clicked tab
    const handleTabChange = (index: number) => {
        setActiveTab(index);
    };

    const tabsCss = "w-25 text-[8px] md:w-40 md:text-[14px]"
    
    let content;
    if(activeTab === 0) {
        content = <ViewCompetitions />;
    } else if (activeTab === 2) {
        content = <ViewCompetitions liveOnly={true} />;
    } else if (activeTab === 3) {
        content = <ManageUsersView />;
    } else{
        content = <CreateCompetition  id ={"-1"}/>;
    }

    return (
        <div className='Flex flex-col w-full h-full'>

            <div className='flex flex-row justify-center items-center w-full mt-4 mb-4'>
                <Tabs defaultValue="editComps" className="w-[400px] justify-center items-center">
                    <TabsList>
                        <TabsTrigger className={tabsCss} onClick={() => handleTabChange(0)} value="editComps">Edit competitions</TabsTrigger>
                        <TabsTrigger className={tabsCss} onClick={() => handleTabChange(1)} value="create">Create competitions</TabsTrigger>
                        <TabsTrigger className={tabsCss} onClick={() => handleTabChange(2)} value="updateLive">Live competitions</TabsTrigger>
                        <TabsTrigger className={tabsCss} onClick={() => handleTabChange(3)} value="password">Manage users</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Line css={{width: 'full', height: '3px', background: '#03adfc', marginBottom: '2rem'}} />
            { content }
        </div>
    );
        
           
};



// ViewCompetitions component to display all the competitions
const ViewCompetitions: React.FC<{ liveOnly?: boolean }> = ({ liveOnly = false }) => {
    const [searchText, setSearchText] = React.useState<string>('');
    const [showActiveCompetitions, setShowActiveCompetitions] = React.useState<boolean>(false);
    const [showOpenCompetitions, setShowOpenCompetitions] = React.useState<boolean>(false);
    const [showUnfinishedCompetitions, setShowUnfinishedCompetitions] = React.useState<boolean>(true);
    const [showUpcomingCompetitions, setShowUpcomingCompetitions] = React.useState<boolean>(false);
    const [competitions, setCompetitions] = React.useState<CompetitionListItem[]>([]);
    const [loadError, setLoadError] = React.useState<string>('');
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [totalPages, setTotalPages] = React.useState<number>(0);
    const [isEditorOpen, setIsEditorOpen] = React.useState<boolean>(false);

    const setMeetData = useMeetStore((state) => state.setMeetData);

    const setAlert = useAlertStore((state) => state.setAlert);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchText, showActiveCompetitions, showOpenCompetitions, showUnfinishedCompetitions, showUpcomingCompetitions]);

    React.useEffect(() => {
        const statuses: CompetitionFilterStatus[] = [];
        if (!liveOnly) {
            if (showUnfinishedCompetitions) statuses.push('incomplete');
            if (showUpcomingCompetitions) statuses.push('upcoming');
            if (showOpenCompetitions) statuses.push('open');
            if (showActiveCompetitions) statuses.push('current');
        }

        const run = window.setTimeout(async () => {
            if (!ADMIN_USER_ID) {
                const missingIdMessage = 'Missing VITE_ADMIN_USER_ID. Set it in swim-swam-front-end/.env.local';
                setLoadError((prev) => (prev === missingIdMessage ? prev : missingIdMessage));
                setCompetitions((prev) => (prev.length === 0 ? prev : []));
                setTotalPages((prev) => (prev === 0 ? prev : 0));
                return;
            }

            setLoadError((prev) => (prev === '' ? prev : ''));

            try {
                if (liveOnly) {
                    const allActive = await meetApi.getActiveCompetitions(ADMIN_USER_ID);
                    const normalizedSearch = searchText.trim().toLowerCase();
                    const filtered = normalizedSearch.length > 0
                        ? allActive.filter((competition) => competition.title.toLowerCase().includes(normalizedSearch))
                        : allActive;

                    const nextTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                    const clampedPage = Math.max(1, Math.min(nextTotalPages, currentPage));
                    const start = (clampedPage - 1) * PAGE_SIZE;
                    const pageItems = filtered.slice(start, start + PAGE_SIZE);

                    setCompetitions((prev) => (areCompetitionListsEqual(prev, pageItems) ? prev : pageItems));
                    setTotalPages((prev) => (prev === nextTotalPages ? prev : nextTotalPages));
                    if (clampedPage !== currentPage) {
                        setCurrentPage(clampedPage);
                    }
                } else {
                    const result = await meetApi.getCompetitions({
                        statuses,
                        search: searchText,
                        page: currentPage,
                        pageSize: PAGE_SIZE,
                    }, ADMIN_USER_ID);

                    setCompetitions((prev) => (areCompetitionListsEqual(prev, result.items) ? prev : result.items));
                    setTotalPages((prev) => (prev === result.totalPages ? prev : result.totalPages));
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load competitions';
                setLoadError((prev) => (prev === message ? prev : message));
                setCompetitions((prev) => (prev.length === 0 ? prev : []));
                setTotalPages((prev) => (prev === 0 ? prev : 0));
            }
        }, 250);

        return () => {
            window.clearTimeout(run);
        };
    }, [searchText, showActiveCompetitions, showOpenCompetitions, showUnfinishedCompetitions, showUpcomingCompetitions, currentPage, liveOnly]);

    const closeEditor = () => {
        setIsEditorOpen(false);
    };

    const handleEditCompetition = async (competitionId: string) => {
        if (!ADMIN_USER_ID) {
            setAlert?.({
                show: true,
                message: 'Missing VITE_ADMIN_USER_ID. Set it in swim-swam-front-end/.env.local',
                confirmAction: () => {},
            });
            return;
        }

        try {
            const competitionData = await meetApi.getCompetitionById(competitionId, ADMIN_USER_ID);
            setMeetData(competitionToMeetData(competitionData));
            setIsEditorOpen(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load competition';
            setAlert?.({
                show: true,
                message,
                confirmAction: () => {},
            });
        }
    };

    const cards = competitions.map((competition) => (
        <Card
            key={competition.comp_id}
            id={String(competition.comp_id)}
            title={competition.title}
            type='editPage'
            status={mapCompetitionStatusToCardNumber(competition.status)}
            dates={[
                ['Starts on:', formatDateLabel(competition.starts_on)],
                ['Ends on:', formatDateLabel(competition.entries_open)],
            ]}
            editable={competition.status === 'incomplete' || competition.status === 'upcoming'}
            onEditCompetition={handleEditCompetition}
        />
    ));

    const handlePageChange = (nextPage: number) => {
        const clamped = Math.max(1, Math.min(totalPages, nextPage));
        setCurrentPage((prev) => (prev === clamped ? prev : clamped));
    };

    return (
        <div className='flex flex-col w-full h-full min-h-[70vh]'>

            <div className='flex flex-row justify-center items-center w-full mt-12 mb-8'>
             <Input
                className='w-1/2 text-white'
                placeholder='Search for competitions'
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
             />
            </div>
           

            {liveOnly ? null : (
                <div className='flex flex-row justify-center flex-wrap w-full'>
                    <SwitchLabel
                        label='Show active competitions'
                        checked={showActiveCompetitions}
                        onCheckedChange={setShowActiveCompetitions}
                        id='show-active-competitions'
                    />
                    <SwitchLabel
                        label='Show unfinished competitions'
                        checked={showUnfinishedCompetitions}
                        onCheckedChange={setShowUnfinishedCompetitions}
                        id='show-unfinished-competitions'
                    />
                    <SwitchLabel
                        label='Show upcoming competitions'
                        checked={showUpcomingCompetitions}
                        onCheckedChange={setShowUpcomingCompetitions}
                        id='show-upcoming-competitions'
                    />
                    <SwitchLabel
                        label='Show open competitions'
                        checked={showOpenCompetitions}
                        onCheckedChange={setShowOpenCompetitions}
                        id='show-open-competitions'
                    />
                </div>
            )}
            <div className='flex-1'>
                <div className='flex flex-row justify-evenly flex-wrap w-full'>
                    {cards}
                </div>
                {loadError ? <p className='text-center text-red-300 mt-2'>{loadError}</p> : null}
                {!loadError && cards.length === 0 ? (
                    <p className='text-center text-gray-300 mt-2'>No competitions match your filters.</p>
                ) : null}
            </div>
            {totalPages > 1 ? (
                <div className='mt-auto pt-3'>
                    <Pagination>
                        <PaginationContent className=''>
                            <PaginationItem>
                                <PaginationPrevious
                                    className='text-blue-400'
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handlePageChange(currentPage - 1);
                                    }}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink
                                            className='text-blue-400'
                                            href="#"
                                            isActive={pageNumber === currentPage}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                handlePageChange(pageNumber);
                                            }}
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem>
                                <PaginationNext
                                    className='text-blue-400'
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handlePageChange(currentPage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}

            {isEditorOpen ? (
                <>
                    <div className='absolute top-0 left-0 z-2 w-full h-full flex justify-center items-start pt-8'>
                        <CompetitionEditor onClick={closeEditor} />
                    </div>
                    <BlurBackground zIndex={1} />
                </>
            ) : null}

        </div>
    );
}

/**
 * This component is used to create a new competition.
 * @returns Component to create a new competition
 */


const CreateCompetition: React.FC<CreateCompetitionProps> = () => {

     type MeetStoreState = {
        setMeetData: (data: MeetData) => void;
    }

    
    const [competition, setCompetition] = React.useState<React.ReactNode>(null);
    const [isBlurred, setIsBlurred] = React.useState<boolean>(false);
    const setMeet = useMeetStore((state: MeetStoreState) => state.setMeetData);


    const handleClose = () => {
        setCompetition(null);
        setIsBlurred(false);
    };
    return (
        <div className='flex flex-col justify-center items-center w-full h-full'>
            {competition === null ? (
                <PlusButton
                    onClick={() => {
                        setCompetition(<CompetitionEditor  onClick={handleClose} />);
                        setIsBlurred(true);
                        setMeet(convertMeetData(meetJson))
                    }}
                    txt={"Create new competition"}
                />
            ) : (
                <CompetitionEditor onClick={handleClose} />
            )}
            {isBlurred && <BlurBackground zIndex={1} />}
        </div>
    );
}

// CompetitionEditorEventSettings component to handle the settings for the competition for the event editor
const CompetitionEditorEventSettings: React.FC = () => {

    type MeetStoreState = {
        meetData: {
            title: string; // title of the meet
            type: string; // type can be 'scy', 'scm', or 'lcm'
            gender: string; // gender can be 'c', 'w', or 'm'
            startDate: string; // startDate is a string in the format 'YYYY-MM-DD'
            entriesCloseDate: string; // entriesCloseDate is a string in the format 'YYYY-MM-DD'
            // add other properties if needed
        };
        updateDistance?: (distance: string) => void;
        updateGender?: (gender: string) => void;
        updateTitle?: (title: string) => void;
        updateEntriesCloseDate?: (date: string) => void;
        updateStartDate?: (date: string) => void;
    }
    const meetType: string = useMeetStore((state: MeetStoreState) => state.meetData.type);
    const meetTitle: string = useMeetStore((state: MeetStoreState) => state.meetData.title);
    const meetGender: string = useMeetStore((state: MeetStoreState) => state.meetData.gender);
    const meetStartDate: string = useMeetStore((state: MeetStoreState) => state.meetData.startDate);
    const entriesCloseDate: string = useMeetStore((state: MeetStoreState) => state.meetData.entriesCloseDate);
    const setMeetTitle = useMeetStore((state: MeetStoreState) => state.updateTitle);
    const setMeetDistance = useMeetStore((state: MeetStoreState) => state.updateDistance);
    const setMeetGender = useMeetStore((state: MeetStoreState) => state.updateGender);
    const setEntriesCloseDate = useMeetStore((state: MeetStoreState) => state.updateEntriesCloseDate);
    const setStartDate = useMeetStore((state: MeetStoreState) => state.updateStartDate);

    const todayUtc = toUtcDateOnly(new Date());
    const minEntriesCloseDate = addDaysUtc(todayUtc, 1);
    const entriesCloseDateParsed = parseOptionalDate(entriesCloseDate);
    const normalizedEntriesDate = entriesCloseDateParsed && toUtcDateOnly(entriesCloseDateParsed).getTime() >= minEntriesCloseDate.getTime()
        ? toUtcDateOnly(entriesCloseDateParsed)
        : minEntriesCloseDate;
    const minStartDate = addDaysUtc(normalizedEntriesDate, 1);
    const meetStartDateParsed = parseOptionalDate(meetStartDate);

    useEffect(() => {
        const entriesValue = formatDateOnly(normalizedEntriesDate);
        if (entriesCloseDate !== entriesValue) {
            setEntriesCloseDate?.(entriesValue);
        }

        const parsedStartDate = meetStartDateParsed ? toUtcDateOnly(meetStartDateParsed) : undefined;
        if (!parsedStartDate || parsedStartDate.getTime() < minStartDate.getTime()) {
            setStartDate?.(formatDateOnly(minStartDate));
        }
    }, [entriesCloseDate, meetStartDate, normalizedEntriesDate, minStartDate, meetStartDateParsed, setEntriesCloseDate, setStartDate, meetType]);

    return (
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <div className='flex flex-col justify-center items-center w-full'>
                    <h2 className='text-2xl text-center mt-6   text-white'>
                        Competition title   
                    </h2>
                    <Input onChange={(e) => setMeetTitle?.(e.target.value)} value={meetTitle} placeholder={"Enter meet title"} className=' mt-5 -mb-4 w-100 bg-white'/>
                </div>
                
        
        <div className='flex flex-col sm:flex-row justify-center flex-wrap items-center w-full mt-10 mb-4'>
                
                <div className="mt-5 mb-30 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20">
                    <Combobox
                        options={[
                            { value: 'scy', label: 'Short course yards' },
                            { value: 'scm', label: 'Short course meters' },
                            { value: 'lcm', label: 'Long course meters' }
                        ]}
                        baseValue={meetType}
                        action={setMeetDistance}
                    />
                </div>
                <div className="mt-5 mb-30 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20">
                    <Combobox options={[
                        { value: 'c', label: 'Combined' },
                        { value: 'w', label: 'Women' },
                        { value: 'm', label: 'Men' }
                    ]} 
                        baseValue={meetGender}
                        action={setMeetGender}
                        
                    />
                </div>
                <div className='w-full flex flex-col sm:flex-row items-center justify-center h-auto'>
                    <div className='h-40 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20'>
                        <DatePicker txt='Competition entries close date' minDate={minEntriesCloseDate} savedDate={parseOptionalDate(entriesCloseDate)} action={setEntriesCloseDate}/>
                    </div>
                    
                    <div className='h-40 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20'>
                        <DatePicker  txt='Competition start date' minDate={minStartDate} savedDate={parseOptionalDate(meetStartDate)} action={setStartDate}/>
                    </div>
                </div>
            </div>
        </div>
    );
}


// EditEvent component to handle individual event editing
const EditEvent: React.FC<{ dayNumber: number; eventNumber: number; clickBack?: () => void }> = ({ dayNumber, eventNumber, clickBack }) => {


    const event = useMeetStore((state) => state.meetData.days[dayNumber].events[eventNumber]);

    return(
        <div>
            <Card title={event.title} type={'swimmers'} clickEvent={clickBack} index={dayNumber} eventIndex={eventNumber} swimmers={event.swimmers.map(swimmer => swimmer.name)} />
        </div>
    );
}

/**
 * A component to display the events for the competition editor or swimmers.
 * @returns Component to display the events for the competition editor or swimmers
 */

interface CompetitionEditorEventsProps {
    handleAddEvent?: (toggle: boolean, index: number) => void;
    backArrow:() => void;
    hideButtons: () => void;
}

const CompetitionEditorEvents: React.FC<CompetitionEditorEventsProps> = ({ handleAddEvent, backArrow, hideButtons }) => {

    const [editSwimmers, setEditSwimmers] = React.useState<React.ReactNode>(null);
    const [displayEvents, setDisplayEvents] = React.useState<boolean>(true);

      type Swimmer = {
        name: string;
        time: string;
        // add other swimmer properties as needed
    };

    type Event = {
        id: string;
        title: string;
        swimmers: Swimmer[];
        // add other event properties as needed
    };

    type Day = {
        id: string;
        events: Event[];
        title: string;
        // add other day properties as needed
    };

    type MeetStoreState = {
        meetData: {
            days: Day[];
        };
    };
    

    const editEvent = (day: number, event: number) => {
        setEditSwimmers(<EditEvent  clickBack={() =>{backArrow(); setDisplayEvents(true)}} dayNumber={day} eventNumber={event} />);
        setDisplayEvents(false);
        hideButtons();
    };


    let days: React.ReactNode = null;
    // Get the meet data from the store
    const meetDays: Day[] = useMeetStore((state: MeetStoreState) => state.meetData.days);
    // Map through the meetDays to create a Card for each day
    // Each Card will display the title of the day and will be clickable to edit the event
    if(displayEvents) {
        days = meetDays.map((day, index) => {

            return (
                <Card key={day.id ?? String(index)} clickEvent={editEvent} handleAddEvent={handleAddEvent} index={index} title={day.title} type={'eventPage'} id={day.id} />
            );
        });
    }

    return(
        <div className='flex flex-wrap justify-center'>
            {displayEvents ? days : editSwimmers}
        </div>
    );
}


interface CompetitionEditorProps {
    new?: boolean;
    onClick?: () => void;
}

const CompetitionEditor: React.FC<CompetitionEditorProps> = ({onClick }) => {

    type MeetStoreState = {
        addDay: () => void;
    }

    // State to manage the active tab in the competition editor
    // It can be either the event settings, events, or edit JSON tab
    const [activeTab, setActiveTab] = React.useState<React.ReactNode>(<CompetitionEditorEventSettings />);
    const [addEvent, setAddEvent] = React.useState<boolean>(false);
    const [showButtons, setShowButtons] = React.useState<boolean>(false);
    const [whichTab, setWhichTab] = React.useState<string>("eventSettings");
    const [editDayIndex, setEditDayIndex] = React.useState<number>(-1);
    

    const addDay = useMeetStore((state: MeetStoreState) => state.addDay);


    const meetData = useMeetStore((state) => state.meetData);

    const persistMeet = async (nextStatus?: number): Promise<void> => {
        const meetDataToSave: MeetData = {
            ...meetData,
            status: nextStatus ?? meetData.status,
            entriesCloseDate: getValidDateOrDefault(meetData.entriesCloseDate),
            startDate: getValidDateOrDefault(meetData.startDate),
        };

        if (meetData.id === "-1") {
            const savedMeet = await meetApi.createMeet(meetDataToSave, ADMIN_USER_ID);
            useMeetStore.getState().setMeetData(savedMeet);
        } else {
            const updatedMeet = await meetApi.updateMeet(meetDataToSave, ADMIN_USER_ID);
            useMeetStore.getState().setMeetData(updatedMeet);
        }
    };

    const saveMeet = async () => {
        try {
            if (!ADMIN_USER_ID) {
                throw new Error('Missing VITE_ADMIN_USER_ID. Set it in swim-swam-front-end/.env.local');
            }

            const dateValidation = validateCompetitionDates(meetData.entriesCloseDate, meetData.startDate);
            if (!dateValidation.valid) {
                setAlert?.({
                    show: true,
                    message: dateValidation.message,
                    confirmAction: () => {},
                });
                return;
            }

            await persistMeet();
            setAlert?.({
                show: true,
                message: "Competition saved successfully.",
                confirmAction: () => {},
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown save error";
            console.error("Error saving meet:", errorMessage);
            setAlert?.({
                show: true,
                message: `Failed to save competition: ${errorMessage}`,
                confirmAction: () => {},
            });
        }
    };

    const submitCompetitionAsUpcoming = async () => {
        try {
            if (!ADMIN_USER_ID) {
                throw new Error('Missing VITE_ADMIN_USER_ID. Set it in swim-swam-front-end/.env.local');
            }

            await persistMeet(0);
            setAlert?.({
                show: true,
                message: "Competition submitted successfully. Status set to upcoming.",
                confirmAction: () => {
                    onClick?.();
                },
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown submit error";
            setAlert?.({
                show: true,
                message: `Failed to submit competition: ${errorMessage}`,
                confirmAction: () => {},
            });
        }
    };

    /**
     * Handle the addition of a new event.
     * @param toggle - Whether to show or hide the add event form.
     */
    const handleAddEvent = (toggle: boolean, index: number) => {
        setShowButtons(true);
        setAddEvent(toggle);
        if(index !== -1){
        setEditDayIndex(index)
        }
    };

    const setAlert = useAlertStore((state) => state.setAlert);

    const exitAlert = {
        show: true,
        message: "Are you sure you want to exit before saving changes?",
        confirmAction: () => {
            onClick?.();
        },
    };

    const handleBackArrowClick = () => {
        setAddEvent(false);
        setShowButtons(false);
    };  

    const handleSubmitCompetition = () => {
        const meetData = useMeetStore.getState().meetData;

        const dateValidation = validateCompetitionDates(meetData.entriesCloseDate, meetData.startDate);
        if (!dateValidation.valid) {
            setAlert?.({
                show: true,
                message: dateValidation.message,
                confirmAction: () => {},
            });
            return;
        }

        const submitValidation = checkCompetitionForSubmit(meetData);

        if (submitValidation.valid) {
            setAlert?.({
                show: true,
                message: `You are about to submit the competition. You can still make changes until ${meetData.entriesCloseDate}.`,
                confirmAction: () => {
                    void submitCompetitionAsUpcoming();
                },
            });
        } else {
            // Show an error message
            setAlert?.({
                show: true,
                message: submitValidation.message,
                confirmAction: () => {
                    onClick?.();
                },
            });
        }
    };


    return (
        <div className='relative z-2 flex flex-col items-center min-h-80 rounded-md bg-gray-800 w-9/10 sm:min-h-150 h-auto mb-10'>
            <IoClose
                className="absolute top-3 left-3 cursor-pointer text-blue-500 transition-transform duration-150 hover:scale-110"
                size={32}
                onClick={() => setAlert?.(exitAlert)}
            />
            <h2 className='text-2xl text-center mt-4 mb-4 text-white'>
                {addEvent ? "" : "Edit Competition"}
            </h2>
            {addEvent ? (
                <AllEvents dayIndex={editDayIndex} backArrow={handleBackArrowClick}/>
            ) : <Tabs defaultValue={whichTab} className="w-[400px] justify-center items-center">
                    {showButtons  ? null : (
                        <TabsList>
                            <TabsTrigger onClick={() => {setActiveTab(<CompetitionEditorEventSettings />); setWhichTab("eventSettings");}}  value="eventSettings">Settings</TabsTrigger>
                            <TabsTrigger onClick={()=> {setActiveTab(<CompetitionEditorEvents hideButtons ={() => setShowButtons(true)} backArrow={handleBackArrowClick} handleAddEvent={handleAddEvent} />); setWhichTab("events");}}  value="events">Events</TabsTrigger>
                        </TabsList>
                    )}  
                </Tabs>}
            {addEvent ? null : <>{activeTab}</>}
            {showButtons  ? null : (
            <div className='flex flex-col justify-center items-center'> 
                {whichTab === 'events' ? (
                <div className='mb-6 mt-4' onClick={() => addDay()}>
                    <Button  variant="secondary" className="text-white w-50 bg-blue-500 cursor-pointer hover:bg-blue-600">
                        Add Day
                    </Button>
                </div>
                ) : null }
                <div className="flex flex-row gap-4 mb-4">
                    <Button variant="secondary" className="text-white w-50 bg-blue-500 cursor-pointer hover:bg-blue-600" onClick={saveMeet}>
                        Save competition
                    </Button>
                    <div onClick={() => handleSubmitCompetition()}>
                        <Button  variant="secondary" className="text-white w-50 bg-blue-500 cursor-pointer hover:bg-blue-600">
                            Submit competition
                        </Button>
                    </div>
                </div>
            </div>
            )}
        </div>
            
    );
}

export default CreateAndEditCompetition;
 