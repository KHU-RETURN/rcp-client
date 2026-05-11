import { rcpConfig } from '../config';
import { ApiRequestError } from '../types';
import { STORAGE_KEYS } from '../constants';

function getPersistedAccessToken(): string | null {
  const raw = localStorage.getItem(STORAGE_KEYS.store);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { state?: { session?: { accessToken?: string; access_token?: string } | null } };
    return parsed.state?.session?.accessToken ?? parsed.state?.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${rcpConfig.apiBaseUrl}${path}`;
  const token = getPersistedAccessToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let body: Record<string, unknown> | null = null;
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    body = (await response.json()) as Record<string, unknown>;
  } else {
    const text = await response.text();
    body = text ? { error: text } : null;
  }

  if (!response.ok) {
    const message =
      typeof body?.error === 'string' ? body.error : `Request failed with ${response.status}`;
    throw new ApiRequestError(message, response.status, body);
  }

  return body as T;
}
