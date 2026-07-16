// Data model for competition data
// Accepts frontend payload naming (camelCase) and backend/db naming (snake_case).
export interface Swimmer {
  id?: string;
  name?: string;
  time?: string | null;
  swimmer_id?: string;
  swimmer_name?: string;
  swimmer_time?: string | null;
  place_finish?: number;
}

export interface CompetitionEvent {
  id?: string;
  title?: string;
  index?: number;
  event_id?: string;
  event_title?: string;
  event_order?: number;
  swimmers: Swimmer[];
}

export interface CompetitionDay {
  id?: string;
  title?: string;
  day_id?: string;
  day_title?: string;
  day_order?: number;
  events: CompetitionEvent[];
}

export interface CompetitionData {
  id?: string;
  comp_id?: string;
  competitionId?: string;
  title: string;
  created_on?: string;
  entriesCloseDate?: string;
  entries_open?: string;
  status: number | 'upcoming' | 'current' | 'completed';
  startDate?: string;
  starts_on?: string;
  gender: string;
  type?: string;
  meet_type?: string;
  days: CompetitionDay[];
}

// Backward-compatible aliases while code paths are migrated.
export type Event = CompetitionEvent;
export type Day = CompetitionDay;

export interface DeletedData {
  deletedData: Map<string, Set<string>>;
}
