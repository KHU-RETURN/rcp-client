export interface StorageContainer {
  name: string;
  created_at: string;
}

export interface StorageObject {
  name: string;
  content_type: string;
  size_bytes: number;
  last_modified: string;
}

export interface CreateContainerPayload {
  name: string;
}

export interface CreateContainerResponse {
  name: string;
  created_at: string;
}

export interface UploadObjectResponse {
  key: string;
}

export type StorageContainersStatus = 'idle' | 'loading' | 'ready';
export type StorageObjectsStatus = 'idle' | 'loading' | 'ready';

export type StorageActionState = 'idle' | 'saving' | 'error';

export interface StorageActionStatus {
  state: StorageActionState;
  message: string;
}
