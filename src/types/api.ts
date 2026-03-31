import type { InstanceMode } from './compute';

export interface BackendHealthResponse {
  available: boolean;
  target?: string;
  error?: string;
}

export interface CreateInstancePayload {
  name: string;
  image_id: string;
  flavor_id: string;
  network_id?: string;
}

export interface CreateKeypairPayload {
  name: string;
  public_key: string;
}

export interface CreateInstanceResponse {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  updated: string;
  created: string;
  hostid: string;
  status: string;
  progress: number;
  accessIPv4: string;
  accessIPv6: string;
  flavor: { id: string };
  addresses: Record<string, unknown>;
  metadata: Record<string, string>;
  links: Array<{ href: string; rel: string }>;
  key_name: string;
  adminPass: string;
  security_groups: Array<{ name: string }>;
  'os-extended-volumes:volumes_attached': Array<{ id: string }>;
  fault: null | { message: string; code: number };
  tags: null | string[];
  server_groups: null | string[];
}

export interface CreationResult {
  type: 'success' | 'error';
  mode: InstanceMode;
  request: CreateInstancePayload;
  response?: CreateInstanceResponse;
  error?: string;
  instanceId: string | null;
}

export class ApiRequestError extends Error {
  status: number;
  body: Record<string, unknown> | null;

  constructor(message: string, status: number, body: Record<string, unknown> | null) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}
