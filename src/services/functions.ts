import { apiRequest } from './api';
import type {
  CloudFunction,
  FunctionLanguage,
  FunctionResult,
  FunctionDataItem,
  IssuedFunctionKey,
} from '../types/functions';

const base = '/api/v1/functions';

export function listFunctions(): Promise<CloudFunction[]> {
  return apiRequest<CloudFunction[]>(base);
}

export function createFunction(
  name: string,
  language: FunctionLanguage,
  file: File,
  dataMode = false,
): Promise<CloudFunction> {
  const body = new FormData();
  body.set('name', name);
  body.set('language', language);
  body.set('data_mode', String(dataMode));
  body.set('file', file);
  return apiRequest<CloudFunction>(base, { method: 'POST', body });
}

export function updateFunction(
  id: string,
  language: FunctionLanguage,
  file: File,
  dataMode = false,
): Promise<CloudFunction> {
  const body = new FormData();
  body.set('file', file);
  body.set('language', language);
  body.set('data_mode', String(dataMode));
  return apiRequest<CloudFunction>(`${base}/${encodeURIComponent(id)}`, { method: 'PUT', body });
}

export function deleteFunction(id: string): Promise<void> {
  return apiRequest<void>(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function issueFunctionKey(id: string, expiresInDays: number): Promise<IssuedFunctionKey> {
  return apiRequest<IssuedFunctionKey>(`${base}/${encodeURIComponent(id)}/key`, {
    method: 'POST',
    body: JSON.stringify({ expires_in_days: expiresInDays }),
  });
}

export function revokeFunctionKey(id: string): Promise<void> {
  return apiRequest<void>(`${base}/${encodeURIComponent(id)}/key`, { method: 'DELETE' });
}

export function invokeFunction(id: string, input: string): Promise<FunctionResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error('입력은 JSON 객체여야 합니다.');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('입력은 JSON 객체여야 합니다.');
  }
  if (new TextEncoder().encode(input).length > 64 * 1024) {
    throw new Error('입력은 64 KB 이하여야 합니다.');
  }
  return apiRequest<FunctionResult>(`${base}/${encodeURIComponent(id)}/invoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: input,
  });
}

function dataBase(id: string, collection: string): string {
  return `${base}/${encodeURIComponent(id)}/data/${encodeURIComponent(collection)}`;
}

export function listFunctionData(
  id: string,
  collection: string,
  offset = 0,
): Promise<FunctionDataItem[]> {
  return apiRequest<FunctionDataItem[]>(`${dataBase(id, collection)}?offset=${offset}`);
}

export function getFunctionData(
  id: string,
  collection: string,
  key: string,
): Promise<FunctionDataItem> {
  return apiRequest<FunctionDataItem>(`${dataBase(id, collection)}/${encodeURIComponent(key)}`);
}

export function putFunctionData(
  id: string,
  collection: string,
  key: string,
  value: unknown,
): Promise<FunctionDataItem> {
  return apiRequest<FunctionDataItem>(`${dataBase(id, collection)}/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
}

export function deleteFunctionData(id: string, collection: string, key: string): Promise<void> {
  return apiRequest<void>(`${dataBase(id, collection)}/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  });
}
