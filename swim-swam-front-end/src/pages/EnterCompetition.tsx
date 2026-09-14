import Hamburger from '@/components/ui/hamburger';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { IoTrashOutline } from 'react-icons/io5';
import { LuGrid2X2, LuGrid3X3 } from 'react-icons/lu';
import { RxHamburgerMenu } from 'react-icons/rx';
import {
	generalInfoApi,
	type CompetitionPickInput,
	type EntryCompetitionData,
	type EntryCompetitionDay,
	type EntryCompetitionEvent,
	type SavedCompetitionPick,
} from '@/services/generalInfoApi';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const REQUIRED_SWIMMER_PICKS = 4;
type CompletionState = 'none' | 'partial' | 'complete';
type EnterCompetitionViewMode = 'drilldown' | 'allEvents' | 'allPicks';

const EMPTY_EVENT_SLOTS = ['', '', '', ''];

const normalizeSavedSlot = (value: number | string | null | undefined): string => {
	if (value === null || value === undefined) return '';
	const normalized = String(value).trim();
	if (!normalized || normalized.toLowerCase() === 'null') return '';
	return normalized;
};

const normalizeSlots = (slots?: string[]): string[] => {
	const safe = slots ?? EMPTY_EVENT_SLOTS;
	return [
		normalizeSavedSlot(safe[0]),
		normalizeSavedSlot(safe[1]),
		normalizeSavedSlot(safe[2]),
		normalizeSavedSlot(safe[3]),
	];
};

const areSlotsEqual = (left: string[], right: string[]): boolean => {
	for (let i = 0; i < REQUIRED_SWIMMER_PICKS; i += 1) {
		if (left[i] !== right[i]) return false;
	}

	return true;
};

const getCompletionStateFromSlots = (slots: string[]): CompletionState => {
	const filledCount = slots.filter((name) => String(name ?? '').trim().length > 0).length;
	if (filledCount === 0) return 'none';
	if (filledCount >= REQUIRED_SWIMMER_PICKS) return 'complete';
	return 'partial';
};

const getGlowClasses = (state: CompletionState): string => {
	if (state === 'complete') {
		return 'border-green-300/80 shadow-[0_0_14px_rgba(74,222,128,0.35)]';
	}

	if (state === 'partial') {
		return 'border-yellow-300/80 shadow-[0_0_14px_rgba(250,204,21,0.35)]';
	}

	return 'border-red-300/80 shadow-[0_0_14px_rgba(248,113,113,0.35)]';
};

const EnterCompetition: React.FC = () => {
	const navigate = useNavigate();
	const [competition, setCompetition] = React.useState<EntryCompetitionData | null>(null);
	const [loadError, setLoadError] = React.useState<string>('');
	const [isLoading, setIsLoading] = React.useState<boolean>(true);
	const [viewMode, setViewMode] = React.useState<EnterCompetitionViewMode>('drilldown');
	const [selectedDayId, setSelectedDayId] = React.useState<string>('');
	const [selectedEventId, setSelectedEventId] = React.useState<string>('');
	const [expandedAllEventsEventId, setExpandedAllEventsEventId] = React.useState<string>('');
	const [openSlotTarget, setOpenSlotTarget] = React.useState<{ eventId: string; slotIndex: number } | null>(null);
	const [eventPicks, setEventPicks] = React.useState<Record<string, string[]>>({});
	const [saveSuccessMessage, setSaveSuccessMessage] = React.useState<string>('');
	const [saveErrorMessage, setSaveErrorMessage] = React.useState<string>('');
	const [isSaving, setIsSaving] = React.useState<boolean>(false);
	const [isSaveSuccessFading, setIsSaveSuccessFading] = React.useState<boolean>(false);
	const initialEventPicksRef = React.useRef<Record<string, string[]>>({});

	// TODO: Replace with selected competition ID from app state/router params.
	const selectedCompetitionId = '1';
	const publicUserId = (import.meta.env.VITE_ADMIN_USER_ID as string | undefined)?.trim() ?? '';

	React.useEffect(() => {
		const run = async () => {
			try {
				setIsLoading(true);
				const data = await generalInfoApi.getCompetitionForEntry(selectedCompetitionId);
				setCompetition(data);

				if (publicUserId) {
					const savedPicks = await generalInfoApi.getSavedCompetitionPicks(selectedCompetitionId, publicUserId);
					const nextEventPicks = savedPicks.reduce<Record<string, string[]>>((accumulator, pick: SavedCompetitionPick) => {
						accumulator[String(pick.eventId)] = [
							normalizeSavedSlot(pick.predictedWinnerId),
							normalizeSavedSlot(pick.predictedSecondId),
							normalizeSavedSlot(pick.predictedThirdId),
							normalizeSavedSlot(pick.predictedFourthId),
						];
						return accumulator;
					}, {});

					setEventPicks(nextEventPicks);
					initialEventPicksRef.current = nextEventPicks;
				} else {
					setEventPicks({});
					initialEventPicksRef.current = {};
				}

				setLoadError('');
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to load competition entry data';
				setLoadError(message);
				setCompetition(null);
				setEventPicks({});
				initialEventPicksRef.current = {};
			} finally {
				setIsLoading(false);
			}
		};

		void run();
	}, [publicUserId, selectedCompetitionId]);

	React.useEffect(() => {
		if (!saveSuccessMessage) {
			setIsSaveSuccessFading(false);
			return;
		}

		setIsSaveSuccessFading(false);
		const fadeTimer = setTimeout(() => {
			setIsSaveSuccessFading(true);
		}, 3300);

		const hideTimer = setTimeout(() => {
			setSaveSuccessMessage('');
			setIsSaveSuccessFading(false);
		}, 4000);

		return () => {
			clearTimeout(fadeTimer);
			clearTimeout(hideTimer);
		};
	}, [saveSuccessMessage]);

	const orderedDays: EntryCompetitionDay[] = React.useMemo(() => {
		const days = competition?.days ?? [];
		return [...days].sort((a, b) => a.dayOrder - b.dayOrder);
	}, [competition?.days]);

	const selectedDay = React.useMemo(() => {
		if (!selectedDayId) return null;
		return orderedDays.find((day) => day.id === selectedDayId) ?? null;
	}, [orderedDays, selectedDayId]);

	const orderedEvents = React.useMemo(() => {
		const events = selectedDay?.events ?? [];
		return [...events].sort((a, b) => a.eventOrder - b.eventOrder);
	}, [selectedDay?.events]);

	const orderedDaysWithEvents = React.useMemo(() => {
		return orderedDays.map((day) => ({
			...day,
			events: [...day.events].sort((a, b) => a.eventOrder - b.eventOrder),
		}));
	}, [orderedDays]);

	const getEventState = React.useCallback((eventId: string): CompletionState => {
		const slots = eventPicks[eventId] ?? ['', '', '', ''];
		return getCompletionStateFromSlots(slots);
	}, [eventPicks]);

	const getDayState = React.useCallback((day: EntryCompetitionDay): CompletionState => {
		if (day.events.length === 0) return 'none';

		const states = day.events.map((event) => getEventState(event.id));
		const allNone = states.every((state) => state === 'none');
		if (allNone) return 'none';

		const allComplete = states.every((state) => state === 'complete');
		if (allComplete) return 'complete';

		return 'partial';
	}, [getEventState]);

	const selectedEvent: EntryCompetitionEvent | null = React.useMemo(() => {
		if (!selectedEventId) return null;
		return orderedEvents.find((event) => event.id === selectedEventId) ?? null;
	}, [orderedEvents, selectedEventId]);

	const getEventSlots = React.useCallback((eventId: string): string[] => {
		const slots = eventPicks[eventId] ?? ['', '', '', ''];
		return [slots[0] ?? '', slots[1] ?? '', slots[2] ?? '', slots[3] ?? ''];
	}, [eventPicks]);

	const getAvailableSwimmersForSlot = React.useCallback((event: EntryCompetitionEvent, slotIndex: number) => {
		const eventSlots = getEventSlots(event.id);

		const selectedInOtherSlots = new Set(
			eventSlots
				.map((swimmerId, index) => ({ swimmerId, index }))
				.filter((entry) => entry.index !== slotIndex && entry.swimmerId)
				.map((entry) => entry.swimmerId),
		);

		const currentSlotValue = eventSlots[slotIndex] ?? '';

		return event.swimmers
			.filter((swimmer) => !selectedInOtherSlots.has(swimmer.id) || swimmer.id === currentSlotValue);
	}, [getEventSlots]);

	const selectSwimmerForSlot = React.useCallback((eventId: string, slotIndex: number, swimmerId: string) => {
		const chosenSwimmerId = String(swimmerId ?? '').trim();
		if (!chosenSwimmerId) return;

		setEventPicks((previous) => {
			const slots = [...(previous[eventId] ?? ['', '', '', ''])];
			if (slots[slotIndex] === chosenSwimmerId) {
				return previous;
			}

			slots[slotIndex] = chosenSwimmerId;
			return {
				...previous,
				[eventId]: slots,
			};
		});

		setOpenSlotTarget(null);
	}, []);

	const clearSlot = React.useCallback((eventId: string, slotIndex: number) => {
		setEventPicks((previous) => {
			const existing = previous[eventId] ?? ['', '', '', ''];
			if (!existing[slotIndex]) return previous;

			const slots = [...existing];
			slots[slotIndex] = '';
			return {
				...previous,
				[eventId]: slots,
			};
		});

		setOpenSlotTarget(null);
	}, []);

	const handleSaveEntries = React.useCallback(() => {
		const allEvents = orderedDaysWithEvents.flatMap((day) => day.events);

		if (!publicUserId) {
			setSaveSuccessMessage('');
			setSaveErrorMessage('Missing VITE_ADMIN_USER_ID. Set it in swim-swam-front-end/.env.local');
			return;
		}

		const changedSlotsByEventId: Record<string, string[]> = {};
		for (const event of allEvents) {
			const currentSlots = normalizeSlots(getEventSlots(event.id));
			const initialSlots = normalizeSlots(initialEventPicksRef.current[event.id]);
			if (!areSlotsEqual(currentSlots, initialSlots)) {
				changedSlotsByEventId[event.id] = currentSlots;
			}
		}

		const changedEventIds = Object.keys(changedSlotsByEventId);
		if (changedEventIds.length === 0) {
			setSaveErrorMessage('');
			setSaveSuccessMessage('No pick changes to save.');
			return;
		}

		const picksPayload: CompetitionPickInput[] = changedEventIds.map((eventId) => {
			const slots = changedSlotsByEventId[eventId] ?? EMPTY_EVENT_SLOTS;
			return {
				eventId,
				predictedWinnerId: (slots[0] ?? '').trim() || null,
				predictedSecondId: (slots[1] ?? '').trim() || null,
				predictedThirdId: (slots[2] ?? '').trim() || null,
				predictedFourthId: (slots[3] ?? '').trim() || null,
			};
		});

		const save = async () => {
			try {
				setIsSaving(true);
				setSaveErrorMessage('');
				setSaveSuccessMessage('');

				const result = await generalInfoApi.saveCompetitionPicks(selectedCompetitionId, publicUserId, picksPayload);
				setSaveSuccessMessage(`Saved ${result.savedCount} event picks.`);
				initialEventPicksRef.current = {
					...initialEventPicksRef.current,
					...changedSlotsByEventId,
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Failed to save picks';
				setSaveErrorMessage(message);
			} finally {
				setIsSaving(false);
			}
		};

		void save();
	}, [getEventSlots, orderedDaysWithEvents, publicUserId, selectedCompetitionId]);

	const renderEventPicker = (event: EntryCompetitionEvent) => {
		const slots = getEventSlots(event.id);
		const hasOpenSlotInEvent = openSlotTarget?.eventId === event.id;

		return (
			<div className={`rounded-md border border-slate-700 bg-slate-900 px-4 py-4 transition-all duration-150 ${hasOpenSlotInEvent ? 'border-slate-200/80 shadow-[0_0_16px_rgba(255,255,255,0.25)]' : ''}`}>
				<div className='space-y-3'>
					{[0, 1, 2, 3].map((slotIndex) => {
						const slotLabel = slotIndex + 1;
						const selectedSwimmerId = slots[slotIndex] ?? '';
						const selectedSwimmerName = event.swimmers.find((swimmer) => swimmer.id === selectedSwimmerId)?.name ?? '';
						const availableSwimmers = getAvailableSwimmersForSlot(event, slotIndex);
						const isSlotOpen = openSlotTarget?.eventId === event.id && openSlotTarget.slotIndex === slotIndex;

						return (
							<Popover
								key={`${event.id}-slot-${slotLabel}`}
								open={openSlotTarget?.eventId === event.id && openSlotTarget.slotIndex === slotIndex}
								onOpenChange={(nextOpen) => setOpenSlotTarget(nextOpen ? { eventId: event.id, slotIndex } : null)}
							>
								<PopoverTrigger asChild>
									<div
										className={`w-full cursor-pointer rounded-md border border-slate-700 bg-slate-950/50 px-3 py-2 flex items-center justify-between gap-3 transition-all duration-150 hover:border-slate-200/80 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)] ${isSlotOpen ? 'border-slate-200/80 shadow-[0_0_16px_rgba(255,255,255,0.25)]' : ''}`}
									>
										<div className='flex items-center gap-3 min-w-0'>
											<span className='text-sm font-semibold text-slate-200 w-5'>{slotLabel}</span>
											<span className='text-sm text-slate-100 truncate'>
												{selectedSwimmerName || 'No swimmer selected'}
											</span>
										</div>
										{selectedSwimmerId ? (
											<IoTrashOutline
												onClick={(mouseEvent) => {
													mouseEvent.stopPropagation();
													clearSlot(event.id, slotIndex);
												}}
												className='cursor-pointer text-slate-300 hover:text-red-400 hover:scale-110 transition-all'
												size={18}
											/>
										) : null}
									</div>
								</PopoverTrigger>
								<PopoverContent className='w-[340px] p-0 border-slate-700 bg-slate-900 text-white'>
									<Command className='bg-slate-900 text-white'>
										<CommandList>
											<CommandEmpty>No swimmers available.</CommandEmpty>
											<CommandGroup>
												{availableSwimmers.map((swimmer) => (
													<CommandItem
														key={`${event.id}-${slotIndex}-${swimmer.id}`}
														value={swimmer.id}
														className='cursor-pointer text-slate-100 data-[selected=true]:bg-slate-700 data-[selected=true]:text-white'
														onSelect={() => selectSwimmerForSlot(event.id, slotIndex, swimmer.id)}
													>
														{swimmer.name}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						);
					})}
				</div>
			</div>
		);
	};

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
							<Button
								type='button'
								variant='ghost'
								className='justify-start text-white hover:bg-slate-800 cursor-pointer'
								onClick={() => navigate('/')}
							>
								Home
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
				<h1 className='text-4xl font-semibold'>{competition?.title ?? 'Enter competition picks'}</h1>
			</div>

			<div className='mt-4 px-6 max-w-3xl mx-auto'>
				<div className='w-fit mx-auto rounded-md border border-slate-700 bg-slate-900 px-2 py-1 flex items-center justify-center gap-1'>
					<button
						type='button'
						title='Day view'
						onClick={() => {
							setViewMode('drilldown');
							setSelectedDayId('');
							setSelectedEventId('');
							setExpandedAllEventsEventId('');
							setOpenSlotTarget(null);
						}}
						className={`cursor-pointer rounded-md p-1.5 transition-all ${viewMode === 'drilldown' ? 'bg-blue-500/30 text-blue-200' : 'text-slate-300 hover:bg-slate-800'}`}
						aria-label='Day-by-day view'
					>
						<LuGrid2X2 size={16} />
					</button>
					<button
						type='button'
						title='Meet view'
						onClick={() => {
							setViewMode('allEvents');
							setSelectedDayId('');
							setSelectedEventId('');
							setExpandedAllEventsEventId('');
							setOpenSlotTarget(null);
						}}
						className={`cursor-pointer rounded-md p-1.5 transition-all ${viewMode === 'allEvents' ? 'bg-blue-500/30 text-blue-200' : 'text-slate-300 hover:bg-slate-800'}`}
						aria-label='All events view'
					>
						<LuGrid3X3 size={16} />
					</button>
					<button
						type='button'
						title='Event view'
						onClick={() => {
							setViewMode('allPicks');
							setSelectedDayId('');
							setSelectedEventId('');
							setExpandedAllEventsEventId('');
							setOpenSlotTarget(null);
						}}
						className={`cursor-pointer rounded-md p-1.5 transition-all ${viewMode === 'allPicks' ? 'bg-blue-500/30 text-blue-200' : 'text-slate-300 hover:bg-slate-800'}`}
						aria-label='All events with picks view'
					>
						<RxHamburgerMenu size={16} />
					</button>
				</div>
				<div className='mt-3 flex flex-col items-center'>
					<Button
						type='button'
						variant='outline'
						className='border-slate-700 bg-slate-900 text-white cursor-pointer transition-all duration-150 hover:bg-slate-900 hover:text-white hover:scale-[1.01] hover:border-slate-200/80 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]'
						onClick={handleSaveEntries}
						disabled={isSaving}
					>
						{isSaving ? 'Saving...' : 'Save'}
					</Button>
					{saveErrorMessage ? <p className='mt-2 text-sm text-red-300'>{saveErrorMessage}</p> : null}
					{saveSuccessMessage ? (
						<p className={`mt-2 text-sm text-green-300 transition-opacity duration-700 ${isSaveSuccessFading ? 'opacity-0' : 'opacity-100'}`}>
							{saveSuccessMessage}
						</p>
					) : null}
				</div>
			</div>

			<div className='mt-16 px-6 max-w-3xl mx-auto'>
				{isLoading ? <p className='text-slate-300 text-center'>Loading competition...</p> : null}
				{loadError ? <p className='text-red-300 text-center mb-6'>{loadError}</p> : null}

				{!isLoading && !loadError && orderedDays.length === 0 ? (
					<p className='text-slate-300 text-center'>No competition days available.</p>
				) : null}

				{!isLoading && !loadError && viewMode === 'drilldown' && orderedDays.length > 0 && !selectedDay ? (
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{orderedDays.map((day) => {
							const dayState = getDayState(day);
							const glowClasses = getGlowClasses(dayState);

							return (
								<div
									key={day.id}
									onClick={() => {
										setSelectedDayId(day.id);
										setSelectedEventId('');
									}}
										className={`cursor-pointer rounded-md border bg-slate-900 px-4 py-4 transition-all duration-200 ease-out hover:shadow-[0_0_16px_rgba(255,255,255,0.25)] ${glowClasses}`}
								>
									<h2 className='text-lg font-semibold text-white'>{day.title || `Day ${day.dayOrder}`}</h2>
									<p className='text-sm text-slate-300 mt-1'>Events: {day.events.length}</p>
								</div>
							);
						})}
					</div>
				) : null}

				{!isLoading && !loadError && viewMode === 'drilldown' && selectedDay && !selectedEvent ? (
					<div>
						<div className='mb-4 flex items-center justify-between gap-4'>
							<h2 className='text-2xl font-semibold text-white'>{selectedDay.title || `Day ${selectedDay.dayOrder}`}</h2>
							<Button
								type='button'
								variant='outline'
								className='border-slate-700 bg-slate-900 text-white cursor-pointer transition-all duration-150 hover:bg-slate-900 hover:text-white hover:scale-[1.01] hover:border-slate-200/80 hover:shadow-[0_0_16px_rgba(255,255,255,0.25)]'
								onClick={() => {
									setSelectedDayId('');
									setSelectedEventId('');
								}}
							>
								Back to days
							</Button>
						</div>

						{orderedEvents.length === 0 ? (
							<p className='text-slate-300 text-center'>No events available for this day.</p>
						) : (
							<div className='flex flex-col gap-3'>
								{orderedEvents.map((event) => {
									const eventState = getEventState(event.id);
									const glowClasses = getGlowClasses(eventState);

									return (
										<div
											key={event.id}
											onClick={() => {
												setSelectedEventId(event.id);
												setOpenSlotTarget(null);
											}}
											className={`cursor-pointer rounded-md border bg-slate-900 px-4 py-4 transition-all duration-200 ease-out hover:scale-[1.01] hover:shadow-[0_0_16px_rgba(255,255,255,0.25)] ${glowClasses}`}
										>
											<h3 className='text-lg font-medium text-white'>{event.title}</h3>
											<p className='text-sm text-slate-300 mt-1'>Swimmers: {event.swimmers.length}</p>
										</div>
									);
								})}
							</div>
						)}
					</div>
				) : null}

				{!isLoading && !loadError && viewMode === 'drilldown' && selectedDay && selectedEvent ? (
					<div>
						<div className='mb-4 flex items-center justify-between gap-4'>
							<h2 className='text-2xl font-semibold text-white'>{selectedEvent.title}</h2>
							<Button
								type='button'
								variant='outline'
								className='border-slate-700 bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
								onClick={() => setSelectedEventId('')}
							>
								Back to events
							</Button>
						</div>

						{renderEventPicker(selectedEvent)}
					</div>
				) : null}

				{!isLoading && !loadError && viewMode === 'allEvents' && orderedDaysWithEvents.length > 0 ? (
					<div className='space-y-6'>
						{orderedDaysWithEvents.map((day) => (
							<div key={`all-events-${day.id}`}>
								<h2 className='text-2xl font-semibold text-white mb-3'>{day.title || `Day ${day.dayOrder}`}</h2>
								{day.events.length === 0 ? (
									<p className='text-slate-300'>No events available for this day.</p>
								) : (
									<div className='flex flex-col gap-3'>
										{day.events.map((event) => {
											const eventState = getEventState(event.id);
											const glowClasses = getGlowClasses(eventState);

											return (
												<div
													key={`all-events-item-${event.id}`}
													onClick={() => {
														setExpandedAllEventsEventId((current) => current === event.id ? '' : event.id);
														setOpenSlotTarget(null);
													}}
													className={`cursor-pointer rounded-md border bg-slate-900 px-4 py-4 transition-all duration-200 ease-out hover:shadow-[0_0_16px_rgba(255,255,255,0.25)] ${glowClasses}`}
												>
													<h3 className='text-lg font-medium text-white'>{event.title}</h3>
													<p className='text-sm text-slate-300 mt-1'>Day {day.dayOrder} • Event {event.eventOrder}</p>
													{expandedAllEventsEventId === event.id ? (
														<div className='mt-3' onClick={(mouseEvent) => mouseEvent.stopPropagation()}>
															{renderEventPicker(event)}
														</div>
													) : null}
												</div>
											);
										})}
									</div>
								)}
							</div>
						))}
					</div>
				) : null}

				{!isLoading && !loadError && viewMode === 'allPicks' && orderedDaysWithEvents.length > 0 ? (
					<div className='space-y-6'>
						{orderedDaysWithEvents.map((day) => (
							<div key={`all-picks-${day.id}`}>
								<h2 className='text-2xl font-semibold text-white mb-3'>{day.title || `Day ${day.dayOrder}`}</h2>
								{day.events.length === 0 ? (
									<p className='text-slate-300'>No events available for this day.</p>
								) : (
									<div className='space-y-4'>
										{day.events.map((event) => {
											const eventState = getEventState(event.id);
											const glowClasses = getGlowClasses(eventState);

											return (
												<div key={`all-picks-item-${event.id}`} className={`rounded-md border bg-slate-900 px-4 py-4 ${glowClasses}`}>
													<h3 className='text-lg font-medium text-white mb-3'>{event.title}</h3>
													{renderEventPicker(event)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default EnterCompetition;
