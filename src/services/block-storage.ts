import { apiRequest } from './api';
import type {
  BlockSnapshot,
  BlockVolume,
  CreateSnapshotPayload,
  CreateVolumePayload,
  UpdateVolumePayload,
} from '../types';

const BASE = '/api/v1/block-storage';

function encodeId(id: string): string {
  return encodeURIComponent(id);
}

export async function fetchVolumes(): Promise<BlockVolume[]> {
  const response = await apiRequest<{ volumes: BlockVolume[] | null }>(`${BASE}/volumes`);
  return Array.isArray(response.volumes) ? response.volumes : [];
}

export async function createVolume(payload: CreateVolumePayload): Promise<BlockVolume> {
  return apiRequest<BlockVolume>(`${BASE}/volumes`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateVolume(
  volumeId: string,
  payload: UpdateVolumePayload,
): Promise<BlockVolume> {
  return apiRequest<BlockVolume>(`${BASE}/volumes/${encodeId(volumeId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteVolume(volumeId: string): Promise<void> {
  await apiRequest<void>(`${BASE}/volumes/${encodeId(volumeId)}`, {
    method: 'DELETE',
  });
}

export async function attachVolume(volumeId: string, instanceId: string): Promise<void> {
  await apiRequest(`${BASE}/volumes/${encodeId(volumeId)}/attachments`, {
    method: 'POST',
    body: JSON.stringify({ instanceId }),
  });
}

export async function detachVolume(volumeId: string, instanceId: string): Promise<void> {
  await apiRequest(`${BASE}/volumes/${encodeId(volumeId)}/attachments/${encodeId(instanceId)}`, {
    method: 'DELETE',
  });
}

export async function fetchSnapshots(): Promise<BlockSnapshot[]> {
  const response = await apiRequest<{ snapshots: BlockSnapshot[] | null }>(`${BASE}/snapshots`);
  return Array.isArray(response.snapshots) ? response.snapshots : [];
}

export async function createSnapshot(
  volumeId: string,
  payload: CreateSnapshotPayload,
): Promise<BlockSnapshot> {
  return apiRequest<BlockSnapshot>(`${BASE}/volumes/${encodeId(volumeId)}/snapshots`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteSnapshot(snapshotId: string): Promise<void> {
  await apiRequest<void>(`${BASE}/snapshots/${encodeId(snapshotId)}`, {
    method: 'DELETE',
  });
}
