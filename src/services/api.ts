import { rcpConfig } from '../config';
import { ApiRequestError } from '../types';
import { STORAGE_KEYS } from '../constants';

export function buildApiUrl(path: string): string {
  return `${rcpConfig.apiBaseUrl}${path}`;
}

export function getPersistedAccessToken(): string | null {
  const raw = localStorage.getItem(STORAGE_KEYS.store);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      state?: {
        session?: {
          accessToken?: string;
        } | null;
      };
    };
    return parsed.state?.session?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function buildAuthHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);
  const token = getPersistedAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = buildApiUrl(path);
  const headers = buildAuthHeaders(options.headers);

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

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

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = buildApiUrl(path);
  const headers = buildAuthHeaders(options.headers);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (body?.error) message = body.error;
    } else {
      const text = await response.text().catch(() => '');
      if (text) message = text;
    }
    throw new ApiRequestError(message, response.status, null);
  }

  return response;
}
