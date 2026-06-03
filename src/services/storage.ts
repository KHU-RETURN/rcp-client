import { apiRequest, apiFetch, buildApiUrl, buildAuthHeaders } from './api';
import { encodeObjectKey, getUploadObjectKey, normalizeObjectPrefix } from './storage-paths';
import type {
  StorageContainer,
  StorageObject,
  CreateContainerPayload,
  CreateContainerResponse,
  UploadObjectResponse,
} from '../types';
import { ApiRequestError } from '../types';

const BASE = '/api/v1/storage/containers';

interface UploadObjectOptions {
  onProgress?: (loadedBytes: number, totalBytes: number) => void;
}

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
  options: UploadObjectOptions = {},
): Promise<UploadObjectResponse> {
  const fd = new FormData();
  fd.append('file', file);
  const objectKey = key ?? getUploadObjectKey(file);
  const path = `${BASE}/${encodeContainer(name)}/objects/${encodeObjectKey(objectKey)}`;

  return new Promise<UploadObjectResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', buildApiUrl(path));

    buildAuthHeaders().forEach((value, headerName) => {
      xhr.setRequestHeader(headerName, value);
    });

    xhr.upload.onprogress = (event) => {
      if (!options.onProgress) return;
      const totalBytes = event.lengthComputable ? event.total : file.size;
      options.onProgress(event.loaded, totalBytes);
    };

    xhr.onload = () => {
      const body = parseUploadResponseBody(xhr.responseText);
      if (xhr.status < 200 || xhr.status >= 300) {
        const message =
          typeof body?.error === 'string' ? body.error : `Request failed with ${xhr.status}`;
        reject(new ApiRequestError(message, xhr.status, body));
        return;
      }
      resolve(body as UploadObjectResponse);
    };

    xhr.onerror = () => {
      reject(new ApiRequestError('Network error', xhr.status || 0, null));
    };

    xhr.send(fd);
  });
}

function parseUploadResponseBody(text: string): Record<string, unknown> | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text };
  }
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
