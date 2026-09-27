import { apiRequest } from './api';
import type { AppDatabase, DatabaseBinding, SQLResult } from '../types/functions';

const base = '/api/v1/databases';

export function listDatabases(): Promise<AppDatabase[]> {
  return apiRequest<AppDatabase[]>(base);
}

export function createDatabase(name: string): Promise<AppDatabase> {
  return apiRequest<AppDatabase>(base, { method: 'POST', body: JSON.stringify({ name }) });
}

export function deleteDatabase(id: string): Promise<void> {
  return apiRequest<void>(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function queryDatabase(id: string, sql: string, params: unknown[]): Promise<SQLResult> {
  return apiRequest<SQLResult>(`${base}/${encodeURIComponent(id)}/query`, {
    method: 'POST',
    body: JSON.stringify({ sql, params }),
  });
}

export function listDatabaseBindings(functionID: string): Promise<DatabaseBinding[]> {
  return apiRequest<DatabaseBinding[]>(
    `/api/v1/functions/${encodeURIComponent(functionID)}/databases`,
  );
}

export function bindDatabase(functionID: string, alias: string, databaseID: string): Promise<void> {
  return apiRequest<void>(
    `/api/v1/functions/${encodeURIComponent(functionID)}/databases/${encodeURIComponent(alias)}`,
    { method: 'PUT', body: JSON.stringify({ database_id: databaseID }) },
  );
}

export function unbindDatabase(functionID: string, alias: string): Promise<void> {
  return apiRequest<void>(
    `/api/v1/functions/${encodeURIComponent(functionID)}/databases/${encodeURIComponent(alias)}`,
    { method: 'DELETE' },
  );
}
