export type AuthUser = {
  publicUserId: string;
  username: string;
  email: string;
  isAdmin: boolean;
};

type AuthResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

const parseResponse = async <T,>(response: Response): Promise<AuthResponse<T>> => {
  const payload = await response.json() as AuthResponse<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Authentication request failed');
  }
  return payload;
};

export const authApi = {
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const response = await fetch(`${AUTH_API_URL}/me`, { credentials: 'include' });
    const payload = await parseResponse<AuthUser | null>(response);
    return payload.data;
  },

  signInWithGoogle: async (credential: string): Promise<AuthUser> => {
    const response = await fetch(`${AUTH_API_URL}/google`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    const payload = await parseResponse<AuthUser>(response);
    return payload.data;
  },

  signUp: async (username: string, email: string, password: string): Promise<AuthUser> => {
    const response = await fetch(`${AUTH_API_URL}/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const payload = await parseResponse<AuthUser>(response);
    return payload.data;
  },

  signInWithPassword: async (username: string, password: string): Promise<AuthUser> => {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const payload = await parseResponse<AuthUser>(response);
    return payload.data;
  },

  updateActivity: async (): Promise<void> => {
    const response = await fetch(`${AUTH_API_URL}/activity`, {
      method: 'POST',
      credentials: 'include',
    });
    await parseResponse<null>(response);
  },

  signOut: async (): Promise<void> => {
    const response = await fetch(`${AUTH_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    await parseResponse<null>(response);
  },

  signOutOnUnload: (): void => {
    // sendBeacon fires even as the tab is closing, unlike fetch which gets cancelled.
    navigator.sendBeacon(`${AUTH_API_URL}/logout`);
  },
};
