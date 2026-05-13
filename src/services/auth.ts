import type { Session } from '../types';
import { buildApiUrl } from './api';

type AuthUserPayload = Partial<Session> & {
  user?: Partial<Session>;
  data?: AuthUser;
  tokens?: AuthUser;
  auth?: AuthUser;
  session?: AuthUser;
  access_token?: string;
  refresh_token?: string;
  AccessToken?: string;
  RefreshToken?: string;
  token?: string;
};

type AuthUser = Partial<Session> & {
  user?: Partial<Session>;
  data?: AuthUser;
  tokens?: AuthUser;
  auth?: AuthUser;
  session?: AuthUser;
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

function resolveUserPayload(payload: AuthUserPayload): AuthUser {
  if (payload.user) return payload.user;
  if (payload.data && 'user' in payload.data && payload.data.user) return payload.data.user;
  if (payload.data && !('user' in payload.data)) return payload.data;
  return payload;
}

export function normalizeAuthSession(payload: AuthUserPayload): Session {
  const user = resolveUserPayload(payload);
  const accessToken = findStringValue(payload, ACCESS_TOKEN_KEYS);
  const refreshToken = findStringValue(payload, REFRESH_TOKEN_KEYS);

  return {
    id: user.id ?? user.email ?? 'google',
    name: user.name ?? user.email ?? 'Google User',
    role: user.role ?? 'student',
    subtitle: user.subtitle ?? 'Authenticated with Google',
    email: user.email,
    accessToken,
    refreshToken,
    source: user.source ?? 'google',
  };
}

export function describeSession(session: Session | null): Record<string, unknown> | null {
  if (!session) return null;

  return {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role,
    source: session.source,
    hasAccessToken: Boolean(session.accessToken),
    hasRefreshToken: Boolean(session.refreshToken),
  };
}

export async function fetchAuthSession(logPrefix: string): Promise<Session> {
  console.info(`${logPrefix} requesting /api/v1/auth/me with credentials=include`);

  const response = await fetch(buildApiUrl('/api/v1/auth/me'), {
    credentials: 'include',
  });

  console.info(`${logPrefix} /api/v1/auth/me response`, {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    redirected: response.redirected,
    url: response.url,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.warn(`${logPrefix} /api/v1/auth/me failed`, {
      status: response.status,
      body: body.slice(0, 300),
    });
    throw new Error(`Auth session check failed with ${response.status}`);
  }

  const payload = (await response.json()) as AuthUserPayload;
  console.info(`${logPrefix} /api/v1/auth/me payload shape`, {
    topLevelKeys: Object.keys(payload),
    dataKeys: payload.data ? Object.keys(payload.data) : null,
    userKeys: payload.user ? Object.keys(payload.user) : null,
    dataUserKeys: payload.data?.user ? Object.keys(payload.data.user) : null,
    hasDetectedAccessToken: Boolean(findStringValue(payload, ACCESS_TOKEN_KEYS)),
    hasDetectedRefreshToken: Boolean(findStringValue(payload, REFRESH_TOKEN_KEYS)),
  });

  const session = normalizeAuthSession(payload);

  console.info(`${logPrefix} normalized auth session`, describeSession(session));

  return session;
}
