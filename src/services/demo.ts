import type {
  CreateKeypairPayload,
  CreateInstancePayload,
  CreateInstanceResponse,
  Instance,
  KeypairResponse,
  InstanceMode,
  ServerInstanceResponse,
} from '../types';

export function createDemoKeypair(payload: CreateKeypairPayload): KeypairResponse {
  return {
    name: payload.name,
    fingerprint: 'aa:bb:cc:dd:11:22:33:44',
    public_key: payload.public_key,
  };
}

export function createDemoInstance(
  payload: CreateInstancePayload,
  userId: string,
  keypairName: string,
): CreateInstanceResponse {
  const now = new Date().toISOString();
  return {
    id: `demo-${Math.random().toString(36).slice(2, 10)}`,
    tenant_id: 'demo-project',
    user_id: userId,
    name: payload.name,
    updated: now,
    created: now,
    hostid: 'demo-host',
    status: 'BUILD',
    progress: 0,
    accessIPv4: '',
    accessIPv6: '',
    flavor: { id: payload.flavor_id },
    addresses: {},
    metadata: {},
    links: [],
    key_name: keypairName,
    adminPass: '',
    security_groups: [],
    'os-extended-volumes:volumes_attached': [],
    fault: null,
    tags: null,
    server_groups: null,
  };
}

export function buildInventoryRecord(
  payload: CreateInstancePayload,
  response: CreateInstanceResponse,
  mode: InstanceMode,
  keypairName: string,
  description: string,
): Instance {
  const now = new Date().toISOString();
  const flavorId = response.flavor?.id ?? response.flavor_id ?? payload.flavor_id;
  const imageId = response.image_id ?? payload.image_id;
  const created = response.created ?? now;

  return {
    id: response.id || `local-${Math.random().toString(36).slice(2, 10)}`,
    name: response.name || payload.name,
    status: response.status || (mode === 'live' ? 'BUILD' : 'ACTIVE'),
    created,
    updated: response.updated ?? created,
    flavorId,
    imageId,
    networkId: payload.network_id ?? '',
    keyName: response.key_name ?? keypairName,
    mode,
    source: mode === 'live' ? 'local-live' : 'mock-created',
    note: description,
  };
}

export function buildInventoryRecordFromServer(response: ServerInstanceResponse): Instance {
  const created = response.created ?? new Date().toISOString();
  const flavorId = response.flavor?.id ?? response.flavor_id ?? response.flavor?.name ?? '';

  return {
    id: response.id,
    name: response.name,
    status: response.status,
    created,
    updated: response.updated ?? created,
    flavorId,
    imageId: response.image_id ?? response.image ?? '',
    networkId: '',
    keyName: response.key_name ?? '',
    mode: 'live',
    source: 'local-live',
    note: '',
  };
}
