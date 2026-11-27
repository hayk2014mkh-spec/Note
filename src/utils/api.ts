import type { LanguageCode, Notebook, UserProfile } from '../types/booknote';

let memoryToken: string | null = null;

export function setMemoryToken(token: string | null) {
  memoryToken = token;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'X-Requested-With': 'BookNote',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }
  if (memoryToken) {
    headers['Authorization'] = `Bearer ${memoryToken}`;
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : `Request failed (${res.status})`);
  }
  return data as T;
}

export async function fetchMe(): Promise<{ user: UserProfile } | null> {
  try {
    return await apiFetch<{ user: UserProfile }>('/api/auth/me');
  } catch {
    return null;
  }
}

export async function registerAccount(payload: {
  username: string;
  displayName: string;
  password: string;
  language: LanguageCode;
}): Promise<{ user: UserProfile; token: string }> {
  const res = await apiFetch<{ user: UserProfile; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setMemoryToken(res.token);
  return res;
}

export async function loginAccount(payload: {
  username: string;
  password: string;
}): Promise<{ user: UserProfile; token: string }> {
  const res = await apiFetch<{ user: UserProfile; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setMemoryToken(res.token);
  return res;
}

export async function logoutAccount(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' });
  setMemoryToken(null);
}

export async function updatePreferences(payload: {
  language?: LanguageCode;
  displayName?: string;
}): Promise<{ user: UserProfile }> {
  return apiFetch<{ user: UserProfile }>('/api/auth/preferences', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchNotebooks(): Promise<{ notebooks: Notebook[]; stars: number }> {
  return apiFetch<{ notebooks: Notebook[]; stars: number }>('/api/notebooks');
}

export async function createNotebookApi(
  payload: Partial<Notebook>
): Promise<{ notebook: Notebook; stars: number }> {
  return apiFetch<{ notebook: Notebook; stars: number }>('/api/notebooks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function saveNotebookApi(
  id: string,
  payload: Partial<Notebook>
): Promise<{ notebook: Notebook; stars: number }> {
  return apiFetch<{ notebook: Notebook; stars: number }>(`/api/notebooks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteNotebookApi(id: string): Promise<{ ok: boolean; stars: number }> {
  return apiFetch<{ ok: boolean; stars: number }>(`/api/notebooks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
