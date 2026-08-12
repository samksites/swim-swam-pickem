import type { Day, MeetData } from "@/types/meet";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
};

export type CompetitionListItem = {
  comp_id: number;
  title: string;
  status: 'incomplete' | 'current' | 'upcoming' | 'completed';
  starts_on?: string;
  entries_open?: string;
};

export type CompetitionListFilters = {
  statuses: Array<'incomplete' | 'current' | 'upcoming' | 'completed'>;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type CompetitionListResponse = {
  items: CompetitionListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CompetitionEditorResponse = {
  id: string;
  comp_id: string;
  title: string;
  entriesCloseDate?: string;
  startDate?: string;
  status: 'incomplete' | 'current' | 'upcoming' | 'completed';
  gender: 'm' | 'w' | 'c';
  type: 'scy' | 'scm' | 'lcm';
  days: Day[];
};

export type AdminUserListItem = {
  user_id: number;
  username: string;
  admin: boolean;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";
const COMPETITIONS_API_URL = `${API_BASE_URL}/api/competitions`;

const parseApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const raw = await response.text();
  let payload: ApiResponse<T>;

  try {
    payload = JSON.parse(raw) as ApiResponse<T>;
  } catch {
    const snippet = raw.slice(0, 140).replace(/\s+/g, " ").trim();
    throw new Error(
      `Expected JSON from API but got non-JSON (${response.status} ${response.statusText}). Response starts with: ${snippet || "<empty>"}`
    );
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || payload.message || "Request failed");
  }
  return payload;
};

export const meetApi = {
  createMeet: async (meetData: MeetData, userId?: string): Promise<MeetData> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/createMeet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userId ? { ...meetData, userId } : meetData),
    });

    const payload = await parseApiResponse<MeetData>(response);
    return payload.data;
  },

  updateMeet: async (meetData: MeetData, userId?: string): Promise<MeetData> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userId ? { ...meetData, userId } : meetData),
    });

    const payload = await parseApiResponse<MeetData>(response);
    return payload.data;
  },

  getCompetitions: async (
    filters: CompetitionListFilters,
    userId: string,
  ): Promise<CompetitionListResponse> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        statuses: filters.statuses,
        search: filters.search ?? '',
        page: filters.page ?? 1,
        pageSize: filters.pageSize ?? 10,
      }),
    });

    const payload = await parseApiResponse<CompetitionListResponse>(response);
    return payload.data;
  },

  getCompetitionById: async (compId: string, userId: string): Promise<CompetitionEditorResponse> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/queryById`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        comp_id: compId,
      }),
    });

    const payload = await parseApiResponse<CompetitionEditorResponse>(response);
    return payload.data;
  },

  getActiveCompetitions: async (userId: string): Promise<CompetitionListItem[]> => {
    const response = await fetch(`${COMPETITIONS_API_URL}/active`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    const payload = await parseApiResponse<CompetitionListItem[]>(response);
    return payload.data;
  },

  searchUsersByName: async (name: string, userId: string): Promise<AdminUserListItem[]> => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        name,
      }),
    });

    const payload = await parseApiResponse<AdminUserListItem[]>(response);
    return payload.data;
  },
};