import { apiRequest } from './api';
import { validatePublicKey, translateError } from '../utils';
import type {
  CreateInstancePayload,
  CreateKeypairPayload,
  CreateInstanceResponse,
  KeypairResponse,
  KeypairStatus,
  Instance,
  ServerInstanceResponse,
} from '../types';

function buildInventoryRecord(
  payload: CreateInstancePayload,
  response: CreateInstanceResponse,
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
    status: response.status || 'BUILD',
    created,
    updated: response.updated ?? created,
    flavorId,
    flavorName: undefined,
    imageId,
    networkId: payload.network_id ?? '',
    keyName: response.key_name ?? keypairName,
    note: description,
  };
}

function buildInventoryRecordFromServer(response: ServerInstanceResponse): Instance {
  const created = response.created ?? new Date().toISOString();
  const flavorId = response.flavor?.id ?? response.flavor_id ?? response.flavor?.name ?? '';
  const flavorName = response.flavor?.name;

  return {
    id: response.id,
    name: response.name,
    status: response.status,
    created,
    updated: response.updated ?? created,
    flavorId,
    flavorName,
    imageId: response.image_id ?? response.image ?? '',
    networkId: '',
    keyName: response.key_name ?? '',
    note: '',
  };
}

export async function registerKeypair(payload: CreateKeypairPayload): Promise<KeypairStatus> {
  const { name, public_key: publicKey } = payload;

  if (name.length < 2) {
    return { state: 'error', message: '키 이름은 2자 이상 입력해 주세요.', response: null };
  }

  if (!validatePublicKey(publicKey)) {
    return { state: 'error', message: 'OpenSSH 형식의 공개키를 입력해 주세요.', response: null };
  }

  try {
    const response = await apiRequest<KeypairResponse>('/api/v1/access/keypairs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { state: 'saved', message: '공개키 등록이 완료되었습니다.', response };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { state: 'error', message: translateError(message), response: null };
  }
}

export async function createInstance(
  payload: CreateInstancePayload,
  keypairName: string,
  description: string,
): Promise<{ record: Instance | null; error?: string }> {
  try {
    const response = await apiRequest<CreateInstanceResponse>('/api/v1/compute/instances', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const record = buildInventoryRecord(payload, response, keypairName, description);
    return { record };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { record: null, error: translateError(message) };
  }
}

export async function fetchInstances(): Promise<Instance[]> {
  const response = await apiRequest<ServerInstanceResponse[]>('/api/v1/compute/instances');
  return response.map(buildInventoryRecordFromServer);
}

export async function fetchInstanceById(id: string): Promise<Instance> {
  const response = await apiRequest<ServerInstanceResponse>(
    `/api/v1/compute/instances/${encodeURIComponent(id)}`,
  );
  return buildInventoryRecordFromServer(response);
}
