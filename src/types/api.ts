export interface CreateInstancePayload {
  name: string;
  image_id: string;
  flavor_id: string;
  network_id?: string;
  key_name?: string;
  security_groups?: string[];
}

export interface CreateKeypairPayload {
  name: string;
  public_key: string;
}

export interface CreateInstanceResponse {
  id: string;
  tenant_id?: string;
  user_id?: string;
  name: string;
  updated?: string;
  created?: string;
  hostid?: string;
  status: string;
  progress?: number;
  accessIPv4?: string;
  accessIPv6?: string;
  flavor?: { id: string };
  flavor_id?: string;
  image_id?: string;
  addresses?: Record<string, unknown>;
  metadata?: Record<string, string>;
  links?: Array<{ href: string; rel: string }>;
  key_name?: string;
  adminPass?: string;
  security_groups?: Array<{ name: string }> | string[];
  fixed_ip?: string;
  floating_ip?: string;
  'os-extended-volumes:volumes_attached'?: Array<{ id: string }>;
  fault?: null | { message: string; code: number };
  tags?: null | string[];
  server_groups?: null | string[];
}

export interface ServerInstanceResponse {
  id: string;
  name: string;
  status: string;
  image?: string;
  image_id?: string;
  flavor?: { id: string; name?: string; vcpus?: number; ram?: number; disk?: number };
  flavor_id?: string;
  key_name?: string;
  fixed_ip?: string;
  floating_ip?: string;
  usage?: { cpu_usage: number; memory_usage: number };
  created?: string;
  updated?: string;
}

export interface CreationResult {
  type: 'success' | 'error';
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
