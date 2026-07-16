import type { MeetData } from "@/types/meet";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "";
const COMPETITIONS_API_URL = `${API_BASE_URL}/api/competitions`;

const parseApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const payload = (await response.json()) as ApiResponse<T>;
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
};