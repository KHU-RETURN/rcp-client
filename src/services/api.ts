import { rcpConfig } from '../config';
import { ApiRequestError } from '../types';
import { STORAGE_KEYS } from '../constants';
import { RefreshFailedError, refreshAccessToken } from './auth';
// useStore 는 함수 본문에서만 참조하여 store ↔ services 간 순환 참조 평가 순서 문제를 피한다.
import { useStore } from '../store';

const REFRESH_PATH = '/api/v1/auth/refresh';
const LOGOUT_PATH = '/api/v1/auth/logout';
const LOGIN_ROUTE = '/login';
const AUTH_CALLBACK_ROUTE = '/auth/callback';
const REFRESH_NETWORK_RETRY_DELAY_MS = 500;

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

// 단일 inflight 보장. 동시에 401이 여러 개 떨어져도 refresh 호출은 1회만 발생.
// refresh token rotation 정책 하에서는 병렬 refresh 가 jti mismatch 를 유발하므로 필수.
type RefreshOutcome = 'success' | 'auth_failed' | 'transient';
let refreshPromise: Promise<RefreshOutcome> | null = null;
let authFailureTriggered = false;

// 로그인 성공 시 호출되어 다음 만료 사이클에서 redirect 로직이 다시 동작하도록 한다.
export function resetAuthFailureGuard(): void {
  authFailureTriggered = false;
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith(REFRESH_PATH) || path.startsWith(LOGOUT_PATH);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type AttemptResult = { ok: true; token: string } | { ok: false; kind: 'network' | 'http' };

async function attemptRefresh(): Promise<AttemptResult> {
  try {
    const token = await refreshAccessToken();
    return { ok: true, token };
  } catch (err) {
    const kind = err instanceof RefreshFailedError && err.kind === 'network' ? 'network' : 'http';
    return { ok: false, kind };
  }
}

async function performRefreshInternal(): Promise<RefreshOutcome> {
  const first = await attemptRefresh();
  if (first.ok) {
    useStore.getState().updateAccessToken(first.token);
    return 'success';
  }
  // HTTP 에러는 서버의 명시적 인증 거부 — 재시도 의미 없음. 즉시 로그아웃.
  if (first.kind === 'http') {
    return 'auth_failed';
  }

  // 네트워크 에러 — 일시 단절 가능. 짧은 백오프 후 1회 재시도.
  await sleep(REFRESH_NETWORK_RETRY_DELAY_MS);

  const second = await attemptRefresh();
  if (second.ok) {
    useStore.getState().updateAccessToken(second.token);
    return 'success';
  }
  // 두 번 다 네트워크 = WiFi 끊김 등 일시 장애로 추정. 로그아웃하지 않고 원 요청 401 만 표면화.
  // 두 번째가 HTTP = 첫 시도 중 서버가 회전을 마쳤거나 토큰이 실제로 만료 — 로그아웃.
  return second.kind === 'network' ? 'transient' : 'auth_failed';
}

async function performRefresh(): Promise<RefreshOutcome> {
  if (!refreshPromise) {
    refreshPromise = performRefreshInternal().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function handleAuthFailure(): void {
  if (authFailureTriggered) return;
  authFailureTriggered = true;

  const { logout, setPendingRoutePath } = useStore.getState();
  const currentPath =
    typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
  const onAuthRoute =
    currentPath.startsWith(LOGIN_ROUTE) || currentPath.startsWith(AUTH_CALLBACK_ROUTE);

  // pendingRoutePath 는 logout() 이 비우므로 그 뒤에 다시 세팅한다. partialize 에 포함되어 풀 리로드 후에도 살아남는다.
  logout();

  if (typeof window === 'undefined' || onAuthRoute) {
    return;
  }

  setPendingRoutePath(currentPath);
  window.location.assign(LOGIN_ROUTE);
}

interface AuthedFetchOptions extends RequestInit {
  // 내부 재시도 표시. 외부에서는 사용하지 않는다.
  __retried?: boolean;
}

async function authedFetch(path: string, options: AuthedFetchOptions): Promise<Response> {
  const { __retried, ...init } = options;
  const url = buildApiUrl(path);
  const headers = buildAuthHeaders(init.headers);

  const response = await fetch(url, { ...init, headers });

  if (response.status !== 401 || __retried || isAuthEndpoint(path)) {
    return response;
  }

  const outcome = await performRefresh();
  if (outcome === 'auth_failed') {
    handleAuthFailure();
    return response;
  }
  if (outcome === 'transient') {
    // 네트워크 일시 단절로 추정 — 세션은 유지하고 원 401 을 호출자에게 그대로 돌려준다.
    return response;
  }

  return authedFetch(path, { ...options, __retried: true });
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await authedFetch(path, { ...options, headers });

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
  const response = await authedFetch(path, options);

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
