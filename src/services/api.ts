import { rcpConfig } from '../config';
import { ApiRequestError } from '../types';

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${rcpConfig.apiBaseUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
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
