export interface CloudFunction {
  id: string;
  name: string;
  language: FunctionLanguage;
  data_mode: boolean;
  key_enabled: boolean;
  key_created_at?: string;
  key_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export type FunctionLanguage = 'rust' | 'go' | 'javascript' | 'python' | 'wasm';

export interface IssuedFunctionKey {
  key: string;
  expires_at: string;
}

export interface FunctionResult {
  stdout: string;
  stderr: string;
  exit_code: number;
}

export interface FunctionDataItem {
  collection: string;
  key: string;
  value: unknown;
  updated_at: string;
}

export interface AppDatabase {
  id: string;
  name: string;
  created_at: string;
}

export interface DatabaseBinding {
  alias: string;
  database_id: string;
  database_name: string;
}

export interface SQLResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rows_affected: number;
}
