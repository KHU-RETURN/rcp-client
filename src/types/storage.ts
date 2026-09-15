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

export interface VolumeAttachment {
  instanceId: string;
  instanceName?: string;
  device?: string;
  attachedAt?: string;
}

export interface BlockVolume {
  id: string;
  name: string;
  description: string;
  sizeGiB: number;
  status: string;
  bootable: boolean;
  encrypted: boolean;
  volumeType: string;
  availabilityZone: string;
  createdAt: string;
  attachments: VolumeAttachment[];
}

export interface BlockSnapshot {
  id: string;
  name: string;
  description: string;
  volumeId: string;
  sizeGiB: number;
  status: string;
  createdAt: string;
}

export interface CreateVolumePayload {
  name: string;
  description?: string;
  sizeGiB: number;
  volumeType?: string;
  availabilityZone?: string;
  snapshotId?: string;
}

export interface UpdateVolumePayload {
  name?: string;
  description?: string;
}

export interface CreateSnapshotPayload {
  name: string;
  description?: string;
}

export type StorageContainersStatus = 'idle' | 'loading' | 'ready';
export type StorageObjectsStatus = 'idle' | 'loading' | 'ready';

export type StorageActionState = 'idle' | 'saving' | 'error';

export interface StorageActionStatus {
  state: StorageActionState;
  message: string;
  progress?: number;
}
