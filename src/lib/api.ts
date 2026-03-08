import type { Ticket, User } from '../types';

const BASE = import.meta.env.VITE_API_URL as string;

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const ticketsApi = {
  list: (token: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Ticket[]>(`tickets${qs}`, token);
  },
  create: (token: string, data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) =>
    request<Ticket>('tickets', token, { method: 'POST', body: JSON.stringify(data) }),
  update: (token: string, id: string, data: { status: Ticket['status']; assignedTo?: string }) =>
    request<Ticket>(`tickets/${id}`, token, { method: 'PATCH', body: JSON.stringify(data) }),
};

export const usersApi = {
  list: (token: string, params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<User[]>(`users${qs}`, token);
  },
};
