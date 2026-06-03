import { apiRequest, apiFetch } from './api';
import { encodeObjectKey, getUploadObjectKey, normalizeObjectPrefix } from './storage-paths';
import type {
  StorageContainer,
  StorageObject,
  CreateContainerPayload,
  CreateContainerResponse,
  UploadObjectResponse,
} from '../types';

const BASE = '/api/v1/storage/containers';

function encodeContainer(name: string): string {
  return encodeURIComponent(name);
}

export async function fetchContainers(): Promise<StorageContainer[]> {
  const response = await apiRequest<StorageContainer[] | null>(BASE);
  return Array.isArray(response) ? response : [];
}

export async function createContainer(
  payload: CreateContainerPayload,
): Promise<CreateContainerResponse> {
  return apiRequest<CreateContainerResponse>(BASE, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteContainer(name: string, force = false): Promise<void> {
  const suffix = force ? '?force=true' : '';
  await apiRequest<void>(`${BASE}/${encodeContainer(name)}${suffix}`, {
    method: 'DELETE',
  });
}

export async function fetchObjects(name: string): Promise<StorageObject[]> {
  const response = await apiRequest<StorageObject[] | null>(
    `${BASE}/${encodeContainer(name)}/objects`,
  );
  return Array.isArray(response) ? response : [];
}

export async function uploadObject(
  name: string,
  file: File,
  key?: string,
): Promise<UploadObjectResponse> {
  const fd = new FormData();
  fd.append('file', file);
  const objectKey = key ?? getUploadObjectKey(file);
  return apiRequest<UploadObjectResponse>(
    `${BASE}/${encodeContainer(name)}/objects/${encodeObjectKey(objectKey)}`,
    { method: 'POST', body: fd },
  );
}

export async function downloadObject(name: string, key: string): Promise<Response> {
  return apiFetch(`${BASE}/${encodeContainer(name)}/objects/${encodeObjectKey(key)}`);
}

export async function downloadObjectArchive(name: string, prefix: string): Promise<Response> {
  const params = new URLSearchParams();
  const normalizedPrefix = normalizeObjectPrefix(prefix);
  if (normalizedPrefix) {
    params.set('prefix', normalizedPrefix);
  }
  const suffix = params.toString() ? `?${params.toString()}` : '';
  return apiFetch(`${BASE}/${encodeContainer(name)}/archive${suffix}`);
}

export async function deleteObject(name: string, key: string): Promise<void> {
  await apiRequest<void>(`${BASE}/${encodeContainer(name)}/objects/${encodeObjectKey(key)}`, {
    method: 'DELETE',
  });
}
