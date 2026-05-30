import { apiRequest, apiFetch } from './api';
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

function encodeObjectKey(key: string): string {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
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
  const objectKey = key ?? file.name;
  return apiRequest<UploadObjectResponse>(
    `${BASE}/${encodeContainer(name)}/objects/${encodeObjectKey(objectKey)}`,
    { method: 'POST', body: fd },
  );
}

export async function downloadObject(name: string, key: string): Promise<Blob> {
  const response = await apiFetch(
    `${BASE}/${encodeContainer(name)}/objects/${encodeObjectKey(key)}`,
  );
  return response.blob();
}

export async function deleteObject(name: string, key: string): Promise<void> {
  await apiRequest<void>(`${BASE}/${encodeContainer(name)}/objects/${encodeObjectKey(key)}`, {
    method: 'DELETE',
  });
}
