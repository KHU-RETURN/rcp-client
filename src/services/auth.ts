import type { Session } from '../types';
import { buildApiUrl } from './api';

type AuthPayload = Partial<Session> & {
  user?: Partial<Session>;
  data?: AuthPayload;
  tokens?: AuthPayload;
  auth?: AuthPayload;
  session?: AuthPayload;
  access_token?: string;
  refresh_token?: string;
  AccessToken?: string;
  RefreshToken?: string;
  token?: string;
};

const ACCESS_TOKEN_KEYS = ['accessToken', 'access_token', 'AccessToken', 'token', 'Token'];
const REFRESH_TOKEN_KEYS = ['refreshToken', 'refresh_token', 'RefreshToken'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function findStringValue(value: unknown, keys: string[], depth = 0): string | undefined {
  if (!isRecord(value) || depth > 4) return undefined;

  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate.length > 0) return candidate;
  }

  for (const nested of Object.values(value)) {
    const candidate = findStringValue(nested, keys, depth + 1);
    if (candidate) return candidate;
  }

  return undefined;
}

function resolveUserPayload(payload: AuthPayload): Partial<Session> | AuthPayload {
  if (payload.user) return payload.user;
  if (payload.data && 'user' in payload.data && payload.data.user) return payload.data.user;
  if (payload.data && !('user' in payload.data)) return payload.data;
  return payload;
}

export function normalizeAuthSession(payload: AuthPayload): Session {
  const user = resolveUserPayload(payload);
  const accessToken = findStringValue(payload, ACCESS_TOKEN_KEYS);
  const refreshToken = findStringValue(payload, REFRESH_TOKEN_KEYS);

  return {
    id: user.id ?? user.email ?? 'google',
    name: user.name ?? user.email ?? 'Google User',
    role: user.role ?? 'user',
    subtitle: user.subtitle ?? 'Authenticated with Google',
    email: user.email,
    accessToken,
    refreshToken,
    source: user.source ?? 'google',
  };
}

export async function fetchAuthSession(): Promise<Session> {
  const response = await fetch(buildApiUrl('/api/v1/auth/me'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Auth session check failed with ${response.status}`);
  }

  const payload = (await response.json()) as AuthPayload;
  const session = normalizeAuthSession(payload);

  return session;
}

interface RefreshResponse {
  access_token?: string;
  expires_in?: number;
}

export type RefreshFailureKind = 'network' | 'http';

// network = fetch 가 throw 한 경우 (DNS, TLS, 오프라인 등). 일시 단절일 가능성이 높아 재시도 후보.
// http   = 서버가 응답을 줬으나 ok=false (401 등). 명시적 인증 거부이므로 즉시 로그아웃.
export class RefreshFailedError extends Error {
  constructor(
    public readonly kind: RefreshFailureKind,
    public readonly status?: number,
  ) {
    super(`Refresh failed: ${kind}${status !== undefined ? ` (${status})` : ''}`);
    this.name = 'RefreshFailedError';
  }
}

export async function refreshAccessToken(): Promise<string> {
  let response: Response;
  try {
    response = await fetch(buildApiUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    throw new RefreshFailedError('network');
  }

  if (!response.ok) {
    throw new RefreshFailedError('http', response.status);
  }

  const payload = (await response.json().catch(() => null)) as RefreshResponse | null;
  if (!payload?.access_token) {
    throw new RefreshFailedError('http', response.status);
  }
  return payload.access_token;
}

export async function logoutSession(): Promise<void> {
  await fetch(buildApiUrl('/api/v1/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    // 네트워크 실패 시에도 클라이언트 측 정리는 계속 진행한다.
  });
}
