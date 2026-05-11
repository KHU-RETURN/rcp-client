import { apiRequest } from './api';
import { createDemoInstance, createDemoKeypair, buildInventoryRecord, buildInventoryRecordFromServer } from './demo';
import { validatePublicKey, translateError, wait } from '../utils';
import type {
  CreateInstancePayload,
  CreateKeypairPayload,
  CreateInstanceResponse,
  KeypairResponse,
  KeypairStatus,
  CreationResult,
  Instance,
  ServerInstanceResponse,
} from '../types';

export async function registerKeypair(
  payload: CreateKeypairPayload,
  isDemo: boolean,
): Promise<KeypairStatus> {
  const { name, public_key: publicKey } = payload;

  if (name.length < 2) {
    return { state: 'error', message: '키 이름은 2자 이상 입력해 주세요.', response: null };
  }

  if (!validatePublicKey(publicKey)) {
    return { state: 'error', message: 'OpenSSH 형식의 공개키를 입력해 주세요.', response: null };
  }

  if (isDemo) {
    await wait(240);
    return {
      state: 'demo',
      message: '데모 모드에서 등록을 시뮬레이션했습니다. 실제 백엔드에는 저장되지 않았습니다.',
      response: createDemoKeypair(payload),
    };
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
  isDemo: boolean,
  userId: string,
  keypairName: string,
  description: string,
): Promise<CreationResult> {
  if (isDemo) {
    await wait(420);
    const response = createDemoInstance(payload, userId, keypairName);
    const record = buildInventoryRecord(payload, response, 'demo', keypairName, description);
    return { type: 'success', mode: 'demo', request: payload, response, instanceId: record.id };
  }

  try {
    const response = await apiRequest<CreateInstanceResponse>('/api/v1/compute/instances', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const record = buildInventoryRecord(payload, response, 'live', keypairName, description);
    return { type: 'success', mode: 'live', request: payload, response, instanceId: record.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      type: 'error',
      mode: 'live',
      request: payload,
      error: translateError(message),
      instanceId: null,
    };
  }
}

export async function fetchInstances(): Promise<Instance[]> {
  const response = await apiRequest<ServerInstanceResponse[]>('/api/v1/compute/instances');
  return response.map(buildInventoryRecordFromServer);
}
