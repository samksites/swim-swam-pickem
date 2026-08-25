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
};
