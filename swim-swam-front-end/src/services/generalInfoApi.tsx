type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
};

export type LiveCompetitionListItem = {
  comp_id: number;
  title: string;
  status: 'incomplete' | 'upcoming' | 'open' | 'current' | 'completed';
  starts_on?: string;
};

export type EntryCompetitionSwimmer = {
  id: string;
  name: string;
  time: string;
  placeFinish: number | null;
};

export type EntryCompetitionEvent = {
  id: string;
  title: string;
  eventOrder: number;
  swimmers: EntryCompetitionSwimmer[];
};

export type EntryCompetitionDay = {
  id: string;
  title: string;
  dayOrder: number;
  events: EntryCompetitionEvent[];
};

export type EntryCompetitionData = {
  id: string;
  title: string;
  startDate: string;
  days: EntryCompetitionDay[];
};

export type CompetitionPickInput = {
  eventId: string;
  predictedWinnerId: string | null;
  predictedSecondId: string | null;
  predictedThirdId: string | null;
  predictedFourthId: string | null;
};

export type SaveCompetitionPicksResult = {
  userCompetitionId: number;
  savedCount: number;
};

export type SavedCompetitionPick = {
  eventId: number;
  predictedWinnerId: number | null;
  predictedSecondId: number | null;
  predictedThirdId: number | null;
  predictedFourthId: number | null;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
const COMPETITIONS_API_URL = `${API_BASE_URL}/api/competitions`;

const parseApiResponse = async <T,>(response: Response): Promise<ApiResponse<T>> => {
  const raw = await response.text();
  let payload: ApiResponse<T>;

  try {
    payload = JSON.parse(raw) as ApiResponse<T>;
  } catch {
    const snippet = raw.slice(0, 140).replace(/\s+/g, ' ').trim();
    throw new Error(
      `Expected JSON from API but got non-JSON (${response.status} ${response.statusText}). Response starts with: ${snippet || '<empty>'}`
    );
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || payload.message || 'Request failed');
  }

  return payload;
};

export const generalInfoApi = {
  getLiveCompetitions: async (): Promise<LiveCompetitionListItem[]> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/live`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await parseApiResponse<LiveCompetitionListItem[]>(response);
    return payload.data;
  },

  getCompetitionForEntry: async (competitionId: string): Promise<EntryCompetitionData> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/public/${competitionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await parseApiResponse<EntryCompetitionData>(response);
    return payload.data;
  },

  saveCompetitionPicks: async (
    competitionId: string,
    publicUserId: string,
    picks: CompetitionPickInput[],
  ): Promise<SaveCompetitionPicksResult> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/public/${competitionId}/picks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicUserId,
        picks,
      }),
    });

    const payload = await parseApiResponse<SaveCompetitionPicksResult>(response);
    return payload.data;
  },

  getSavedCompetitionPicks: async (
    competitionId: string,
    publicUserId: string,
  ): Promise<SavedCompetitionPick[]> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/public/${competitionId}/picks/${publicUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await parseApiResponse<SavedCompetitionPick[]>(response);
    return payload.data;
  },
};
